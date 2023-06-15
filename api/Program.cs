using Azure.Data.Tables;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using WhiskeyWheelApi;

var host = new HostBuilder()
    .ConfigureAppConfiguration((context, builder) =>
    {
        builder
            .AddJsonFile(Path.Combine(context.HostingEnvironment.ContentRootPath, "local.settings.json"), optional: true, reloadOnChange: true)
            .AddEnvironmentVariables();
    })
    .ConfigureFunctionsWorkerDefaults()
    .ConfigureServices((builder, services) =>
    {
        var connString = builder.Configuration["StorageConnectionString"];
        var tableServiceClient = new TableServiceClient(connString);
        
        var tableClient = tableServiceClient.GetTableClient(Constants.TableName);
        tableClient.CreateIfNotExists();
        
        services.AddSingleton(tableServiceClient);
        services.AddSingleton(tableClient);
    })
    .Build();

host.Run();