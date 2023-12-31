﻿using Azure;
using Azure.Data.Tables;

namespace WhiskeyWheelApi.Models;

public class NameEntity : ITableEntity
{
    public string PartitionKey { get; set; }
    public string RowKey { get; set; }
    public string Names { get; set; }
    public DateTimeOffset? Timestamp { get; set; }
    public ETag ETag { get; set; }
}