using System.Net;
using System.Text.Json;
using Azure;
using Azure.Data.Tables;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using WhiskeyWheelApi.Models;

namespace WhiskeyWheelApi.Triggers;

public class UpdateNames
{
    private readonly TableServiceClient _tableServiceClient;
    private readonly TableClient _tableClient;

    public UpdateNames(
        TableServiceClient tableServiceClient,
        TableClient tableClient)
    {
        _tableServiceClient = tableServiceClient;
        _tableClient = tableClient;
    }
    
    [Function("UpdateNames")]
    public async Task<HttpResponseData> Run([HttpTrigger(AuthorizationLevel.Function, "post")] HttpRequestData req,
        FunctionContext executionContext)
    {
        var logger = executionContext.GetLogger("UpdateNames");
        var sessionName = req.Query["sessionName"];
        
        string requestBody;
        using (var streamReader =  new StreamReader(req.Body))
        {
            requestBody = await streamReader.ReadToEndAsync();
        }

        var sessionId = string.IsNullOrEmpty(sessionName) ? Guid.NewGuid().ToString() : sessionName;

        var options = new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        };
        
        var nameEntity = JsonSerializer.Deserialize<NameEntity>(requestBody, options);
        if (nameEntity is null)
        {
            return req.CreateResponse(HttpStatusCode.BadRequest);
        }
        
        if (string.IsNullOrEmpty(nameEntity.PartitionKey))
        {
            nameEntity.PartitionKey = sessionId;
            nameEntity.RowKey = sessionId;
        }

        var response = await _tableClient.UpsertEntityAsync(nameEntity, TableUpdateMode.Replace);
        var responseCode = response.Status < 300 ? HttpStatusCode.OK : HttpStatusCode.BadRequest;
        var responseObj = req.CreateResponse(responseCode);
        await responseObj.WriteStringAsync(nameEntity.PartitionKey);
        return responseObj;
    }
}