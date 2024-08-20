function aggregateRepeatedCustomers({ format, limit, page }) {
  return [
    {
      $facet: {
        groupedDocuments: [
          {
            $group: {
              _id: {
                customer_id: "$customer.id",
                date: {
                  $dateToString: {
                    format,
                    date: {
                      $dateFromString: {
                        dateString: "$created_at",
                      },
                    },
                  },
                },
              },
              count: {
                $sum: 1,
              },
            },
          },
          {
            $match: {
              count: {
                $gt: 1,
              },
            },
          },
          {
            $group: {
              _id: "$_id.date",
              repeat_customers: {
                $sum: 1,
              },
            },
          },
          {
            $project: {
              _id: 0,
              date: "$_id",
              repeat_customers: 1,
            },
          },
          {
            $sort: {
              date: -1,
            },
          },
          {
            $skip: (page - 1) * limit,
          },
          {
            $limit: limit,
          },
        ],
        countOfTotalDocuments: [
          {
            $group: {
              _id: {
                $dateToString: {
                  format,
                  date: {
                    $dateFromString: {
                      dateString: "$created_at",
                    },
                  },
                },
              },
            },
          },
          {
            $count: "count",
          },
        ],
      },
    },
    {
      $project: {
        groupedDocuments: 1,
        countOfTotalDocuments: {
          $arrayElemAt: ["$countOfTotalDocuments.count", 0],
        },
      },
    },
  ];
}

module.exports = aggregateRepeatedCustomers;
