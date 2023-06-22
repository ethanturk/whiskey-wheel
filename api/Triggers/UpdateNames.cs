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
        
        string requestBody;
        using (var streamReader =  new StreamReader(req.Body))
        {
            requestBody = await streamReader.ReadToEndAsync();
        }

        var sessionId = Guid.NewGuid();

        var options = new JsonSerializerOptions()
        {
            PropertyNameCaseInsensitive = true
        };
        
        var nameEntity = JsonSerializer.Deserialize<NameEntity>(requestBody, options);
        if (nameEntity is null)
        {
            return req.CreateResponse(HttpStatusCode.BadRequest);
        }

        try
        {
            Response response;
            
            if (string.IsNullOrEmpty(nameEntity.PartitionKey))
            {
                nameEntity.PartitionKey = sessionId.ToString();
                nameEntity.RowKey = sessionId.ToString();

                response =  await _tableClient.AddEntityAsync<NameEntity>(nameEntity);
            }
            else
            {
                response = await _tableClient.UpdateEntityAsync<NameEntity>(nameEntity, ETag.All);
            }
        
            if (response.Status >= 300)
            {
                return req.CreateResponse(HttpStatusCode.InternalServerError);
            }

            var responseCode = response.Status < 300 ? HttpStatusCode.OK : HttpStatusCode.BadRequest;
            return req.CreateResponse(responseCode);
        }
        catch (System.Exception ex)
        {
            throw;
        }
    }
}