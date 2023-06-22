using System.Collections.Immutable;
using System.Net;
using System.Text.Json;
using Azure;
using Azure.Data.Tables;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using WhiskeyWheelApi.Models;

namespace WhiskeyWheelApi.Triggers;

public class CreateSession
{
    private readonly TableServiceClient _tableServiceClient;
    private readonly TableClient _tableClient;

    public CreateSession(
        TableServiceClient tableServiceClient,
        TableClient tableClient)
    {
        _tableServiceClient = tableServiceClient;
        _tableClient = tableClient;
    }
    
    [Function("CreateSession")]
    public async Task<HttpResponseData> Run([HttpTrigger(AuthorizationLevel.Function, "post")] HttpRequestData req,
        FunctionContext executionContext)
    {
        var logger = executionContext.GetLogger("CreateSession");
        
        string requestBody;
        using (var streamReader =  new StreamReader(req.Body))
        {
            requestBody = await streamReader.ReadToEndAsync();
        }

        var sessionId = Guid.NewGuid();

        if (string.IsNullOrEmpty(requestBody))
        {
            return req.CreateResponse(HttpStatusCode.BadRequest);
        }
        
        var pageableResults = _tableClient.QueryAsync<NameEntity>($"PartitionKey eq '{sessionId}'");
        await foreach (var page in pageableResults.AsPages())
        {
            page.Values.ToImmutableList().ForEach(name => _tableClient.DeleteEntity(name.PartitionKey, name.RowKey));
        }

        var response =  await _tableClient.AddEntityAsync<NameEntity>(new NameEntity
        {
            PartitionKey = sessionId.ToString(),
            RowKey = Guid.NewGuid().ToString(),
            Names = requestBody,
        });
        
        if (!response.Status.Equals(200))
        {
            return req.CreateResponse(HttpStatusCode.InternalServerError);
        }
        
        var responseCode = response.Status == 200 ? HttpStatusCode.OK : HttpStatusCode.BadRequest;

        return req.CreateResponse(responseCode);
    }
}