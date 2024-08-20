function aggregateSalesByDate({ format, limit, page }) {
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
              totalAmount: {
                $sum: {
                  $toDouble: "$total_price_set.shop_money.amount",
                },
              },
            },
          },
          {
            $project: {
              _id: 0,
              date: "$_id",
              totalAmount: 1,
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

module.exports = aggregateSalesByDate;
