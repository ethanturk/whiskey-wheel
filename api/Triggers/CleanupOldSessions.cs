using Azure.Data.Tables;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Extensions.Logging;
using WhiskeyWheelApi.Models;

namespace WhiskeyWheelApi.Triggers;

public class CleanupOldSessions
{
    private readonly TableClient _tableClient;

    public CleanupOldSessions(TableClient tableClient)
    {
        _tableClient = tableClient;
    }
    
    [Function("CleanupOldSessions")]
    public async Task Run([TimerTrigger("0 0 23 * * *")] MyInfo myTimer, FunctionContext context)
    {
        var logger = context.GetLogger("CleanupOldSessions");
        logger.LogInformation($"C# Timer trigger function executed at: {DateTime.Now}");
        logger.LogInformation($"Next timer schedule at: {myTimer.ScheduleStatus.Next}");

        var twoDaysAgo = DateTime.UtcNow.AddDays(-2).ToString("yyyy-MM-ddThh:mm:ssZ");
        var pageableResults = _tableClient.QueryAsync<NameEntity>($"Timestamp le datetime'{twoDaysAgo}'");

        await foreach (var page in pageableResults.AsPages())
        {
            page.Values.ToList().ForEach(v => _tableClient.DeleteEntity(v.PartitionKey, v.RowKey));
        }
    }
}

public class MyInfo
{
    public MyScheduleStatus ScheduleStatus { get; set; }

    public bool IsPastDue { get; set; }
}

public class MyScheduleStatus
{
    public DateTime Last { get; set; }

    public DateTime Next { get; set; }

    public DateTime LastUpdated { get; set; }
}