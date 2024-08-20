function aggregateSalesByGrowthRate({ format, limit, page }) {
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
              totalOrders: {
                $sum: 1,
              },
            },
          },
          {
            $project: {
              _id: 0,
              date: "$_id",
              totalOrders: 1,
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

module.exports = aggregateSalesByGrowthRate;
