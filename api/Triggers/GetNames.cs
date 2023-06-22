using System.Net;
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
    public async Task<HttpResponseData> Run([HttpTrigger(AuthorizationLevel.Anonymous, "get", "post")] HttpRequestData req,
        FunctionContext executionContext)
    {
        var logger = executionContext.GetLogger("GetNames");
        var sessionName = req.Query["sessionName"];

        var pageableResults = _tableClient.QueryAsync<NameEntity>($"PartitionKey eq '{sessionName}'");
        var names = string.Empty;

        await foreach (var page in pageableResults.AsPages())
        {
            foreach (var name in page.Values)
            {
                names = name.Names;
            }
        }

        var response = req.CreateResponse(HttpStatusCode.OK);
        await response.WriteStringAsync(names);

        return response;
    }
}