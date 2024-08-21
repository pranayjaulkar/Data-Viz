function aggregateNewCustomers({ format, limit, page }) {
  return [
    {
      $facet: {
        groupedDocuments: [
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
              totalCustomers: {
                $sum: 1,
              },
            },
          },
          {
            $project: {
              date: "$_id",
              _id: 0,
              totalCustomers: 1,
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

module.exports = aggregateNewCustomers;
