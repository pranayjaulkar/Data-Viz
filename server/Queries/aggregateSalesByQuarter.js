function aggregateSalesByQuarter({ limit, page }) {
  return [
    {
      $facet: {
        groupedDocuments: [
          {
            $group: {
              _id: {
                year: {
                  $year: {
                    $dateFromString: {
                      dateString: "$created_at",
                    },
                  },
                },
                quarter: {
                  $ceil: {
                    $divide: [
                      {
                        $month: {
                          $dateFromString: {
                            dateString: "$created_at",
                          },
                        },
                      },
                      3,
                    ],
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
              date: {
                $concat: [{ $toString: "$_id.year" }, "-Q", { $toString: "$_id.quarter" }],
              },
              _id: 0,
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
                year: {
                  $year: {
                    $dateFromString: {
                      dateString: "$created_at",
                    },
                  },
                },
                quarter: {
                  $ceil: {
                    $divide: [
                      {
                        $month: {
                          $dateFromString: {
                            dateString: "$created_at",
                          },
                        },
                      },
                      3,
                    ],
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

module.exports = aggregateSalesByQuarter;
