using System.Net;
using System.Text.Json;
using Azure.Data.Tables;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using WhiskeyWheelApi.Models;

namespace WhiskeyWheelApi.Triggers;

public class GetNames
{
    private readonly TableClient _tableClient;

    public GetNames(TableClient tableClient)
    {
        _tableClient = tableClient;
    }
    
    [Function("GetNames")]
    public async Task<HttpResponseData> Run([HttpTrigger(AuthorizationLevel.Function, "get", "post")] HttpRequestData req,
        FunctionContext executionContext)
    {
        var logger = executionContext.GetLogger("GetNames");
        var sessionName = req.Query["sessionName"];

        var pageableResults = _tableClient.QueryAsync<NameEntity>($"PartitionKey eq '{sessionName}'");
        var names = new List<NameEntity>();

        await foreach (var page in pageableResults.AsPages())
        {
            foreach (var name in page.Values)
            {
                names.Add(new NameEntity()
                {
                    PartitionKey = name.PartitionKey,
                    RowKey = name.RowKey,
                    Order = name.Order
                });
            }
        }

        var response = req.CreateResponse(HttpStatusCode.OK);
        response.Headers.Add("Content-Type", "application/json; charset=utf-8");

        await response.WriteStringAsync(JsonSerializer.Serialize(names));

        return response;
    }
}