/**
 * CMS Five-Star Quality Rating System Knowledge Base
 *
 * This module contains the comprehensive dataset on the CMS Five-Star Quality Rating System
 * for Skilled Nursing Facilities (SNFs). It provides persistent knowledge retention
 * for the my5starreport.com platform.
 *
 * Sources: CMS Technical Users' Guide (July 2023), GAO Reports, AHCA Quality Resources
 * Last Updated: 2024
 */

// ============================================
// COMPREHENSIVE FIVE-STAR DATASET
// ============================================

export const FiveStarDataset = {
  Overview: {
    Description: "CMS Five-Star Quality Rating System for Skilled Nursing Facilities (SNFs)",
    LaunchYear: 2008,
    Updates: [
      "2015: Added QM adjustments and risk standardization",
      "2019: PBJ audits began for staffing verification",
      "2022: COVID freezes lifted, methodology updates",
      "2023: Added turnover metrics and weekend staffing requirements"
    ],
    FacilitiesRated: 15000,
    ImpactMetrics: {
      OccupancyBoost: "5-10% higher for 5-star vs. 1-star facilities",
      PaymentAdjustment: "Up to 2% via SNF VBP (Value-Based Purchasing) Program",
      ReferralImpact: "Higher stars correlate with better referral relationships",
      ReadmissionReduction: "Higher-rated facilities show lower 30-day readmission rates"
    },
    SystemPurpose: "Empower consumers, payers, and regulators with transparent, comparable quality metrics",
    RatingModel: "Relative ranking model - stars determined by national percentile performance",
    UpdateFrequency: "Monthly refreshes, but data lags (inspections use 3-year weighted average)"
  },

  Domains: {
    HealthInspections: {
      Weight: "Base for Overall Rating (40% implicit weight)",
      DataSource: "State surveys via CASPER (Certification and Survey Provider Enhanced Reports)",
      Description: "Examines compliance with 180+ federal requirements across resident rights, infection control, and safety",
      CalculationSteps: [
        {
          Step: 1,
          Name: "Deficiency Scoring",
          Details: "Each citation gets points based on scope and severity grid",
          ScopeOptions: ["Isolated", "Pattern", "Widespread"],
          SeverityOptions: ["No Harm", "Potential Harm", "Actual Harm", "Immediate Jeopardy"],
          Examples: [
            { Level: "D", Description: "Isolated, Potential Harm", Points: 4 },
            { Level: "E", Description: "Pattern, Potential Harm", Points: 8 },
            { Level: "F", Description: "Widespread, Potential Harm", Points: 16 },
            { Level: "G", Description: "Isolated, Actual Harm", Points: 20 },
            { Level: "H", Description: "Pattern, Actual Harm", Points: 35 },
            { Level: "I", Description: "Widespread, Actual Harm", Points: 45 },
            { Level: "J", Description: "Isolated, Immediate Jeopardy", Points: 100 },
            { Level: "K", Description: "Pattern, Immediate Jeopardy", Points: 125 },
            { Level: "L", Description: "Widespread, Immediate Jeopardy", Points: 150 }
          ],
          AbuseMultiplier: "Abuse tags double the point value"
        },
        {
          Step: 2,
          Name: "Cycle Weighting",
          Formula: "Total = (Cycle1 * 0.6) + (Cycle2 * 0.3) + (Cycle3 * 0.1)",
          Details: "Recent cycle = 60% weight, Prior = 30%, Earliest = 10%"
        },
        {
          Step: 3,
          Name: "Adjustments",
          Details: "Add 50% extra points for repeat deficiencies; Full weight for substantiated complaints"
        },
        {
          Step: 4,
          Name: "Star Assignment",
          Details: "National distribution determines cut points",
          Distribution: {
            FiveStar: "Top 10% (lowest scores)",
            FourStar: "Next 23.33%",
            ThreeStar: "Middle 33.33%",
            TwoStar: "Next 23.33%",
            OneStar: "Bottom 10%"
          }
        }
      ],
      StarCutPoints: [
        { Stars: 5, ScoreRange: "0-16", Description: "Excellent compliance" },
        { Stars: 4, ScoreRange: "17-38", Description: "Above average compliance" },
        { Stars: 3, ScoreRange: "39-68", Description: "Average compliance" },
        { Stars: 2, ScoreRange: "69-106", Description: "Below average compliance" },
        { Stars: 1, ScoreRange: "107+", Description: "Poor compliance" }
      ]
    },

    Staffing: {
      DataSource: "PBJ (Payroll-Based Journal) quarterly submissions - mandatory since 2016",
      Metrics: [
        "RN Hours Per Resident Day (HPRD)",
        "Total Nurse HPRD (RN + LPN/LVN)",
        "Aide HPRD",
        "Weekend Staffing (added 2023)",
        "Turnover Rate (added 2023)"
      ],
      CaseMixAdjustment: "Uses STRIVE study data to adjust expected hours based on resident acuity (RUG-IV/PDPM)",
      Formula: "Adjusted HPRD = Actual Hours / Expected Hours (based on case-mix)",
      CalculationSteps: [
        {
          Step: 1,
          Name: "Calculate HPRD",
          Formula: "Total nurse hours / resident days",
          Details: "Separate calculations for RN, total licensed (RN+LPN), and aides"
        },
        {
          Step: 2,
          Name: "Case-Mix Adjustment",
          Details: "Adjust expected hours based on resident acuity using STRIVE study data",
          Example: "Higher expected hours for ventilator-dependent residents"
        },
        {
          Step: 3,
          Name: "Point Scoring",
          Details: "RN points (up to 100) + Total staffing points (up to 50)",
          RNPercentiles: "Top 10% = 100 points, decreasing by percentile"
        },
        {
          Step: 4,
          Name: "Star Assignment",
          Details: "Total points converted to stars with 2023 additions for weekend staffing and turnover"
        }
      ],
      StarThresholds: [
        { Stars: 5, RNPoints: "90-100", TotalPoints: "140-150" },
        { Stars: 4, RNPoints: "70-89", TotalPoints: "110-139" },
        { Stars: 3, RNPoints: "50-69", TotalPoints: "80-109" },
        { Stars: 2, RNPoints: "30-49", TotalPoints: "50-79" },
        { Stars: 1, RNPoints: "0-29", TotalPoints: "0-49" }
      ],
      Post2023Rules: [
        "Weekend RN hours must be >0 for facility to achieve more than 3 stars",
        "High turnover (>60% annual) can deduct up to 1 star",
        "Staffing data verified through audits since 2019"
      ]
    },

    QualityMeasures: {
      LongStayMeasures: 17,
      ShortStayMeasures: 11,
      TotalMeasures: 28,
      TotalPointsMax: 1005,
      DataSource: "MDS (Minimum Data Set) 3.0 assessments + Medicare Part A claims for short-stay",
      RiskAdjustment: "Covariates include age, comorbidities, functional status",
      CalculationMethod: "Percentile ranking - each measure scored 20-100 points based on national percentiles",

      LongStayMeasuresList: [
        {
          Name: "Falls with Major Injury",
          Weight: 3.0,
          Impact: "HIGH",
          Formula: "(Incidents / Eligible Residents) * 100",
          PointsRange: "20-100 (percentile-based)",
          Thresholds: {
            FiveStar: "< 0.5%",
            FourStar: "0.5-1.0%",
            ThreeStar: "1.0-2.0%",
            TwoStar: "2.0-3.5%",
            OneStar: "> 3.5%"
          },
          NationalAverage: "1.8%"
        },
        {
          Name: "Pressure Ulcers (High Risk)",
          Weight: 2.5,
          Impact: "HIGH",
          Formula: "(New Stage 2+ ulcers / High-risk residents) * 100",
          Thresholds: {
            FiveStar: "< 2.0%",
            FourStar: "2.0-4.0%",
            ThreeStar: "4.0-7.0%",
            TwoStar: "7.0-10.0%",
            OneStar: "> 10.0%"
          },
          NationalAverage: "5.2%"
        },
        {
          Name: "Urinary Tract Infections (UTI)",
          Weight: 2.0,
          Impact: "HIGH",
          Formula: "(UTI cases / Eligible residents) * 100",
          Thresholds: {
            FiveStar: "< 1.5%",
            FourStar: "1.5-3.0%",
            ThreeStar: "3.0-5.0%",
            TwoStar: "5.0-7.5%",
            OneStar: "> 7.5%"
          },
          NationalAverage: "3.8%"
        },
        {
          Name: "Antipsychotic Medication Use",
          Weight: 1.5,
          Impact: "MEDIUM",
          Formula: "(Residents on antipsychotics / Eligible residents) * 100",
          Thresholds: {
            FiveStar: "< 10%",
            FourStar: "10-15%",
            ThreeStar: "15-22%",
            TwoStar: "22-30%",
            OneStar: "> 30%"
          },
          NationalAverage: "14.5%",
          Notes: "Excludes residents with schizophrenia, Huntington's, Tourette's"
        },
        {
          Name: "Physical Restraints",
          Weight: 1.5,
          Impact: "MEDIUM",
          Formula: "(Residents restrained daily / All residents) * 100",
          Thresholds: {
            FiveStar: "< 0.1%",
            FourStar: "0.1-0.5%",
            ThreeStar: "0.5-1.0%",
            TwoStar: "1.0-2.0%",
            OneStar: "> 2.0%"
          },
          NationalAverage: "0.4%"
        },
        {
          Name: "Catheter Use",
          Weight: 1.5,
          Impact: "MEDIUM",
          Formula: "(Residents with indwelling catheter / All residents) * 100",
          Thresholds: {
            FiveStar: "< 1.0%",
            FourStar: "1.0-2.0%",
            ThreeStar: "2.0-4.0%",
            TwoStar: "4.0-6.0%",
            OneStar: "> 6.0%"
          },
          NationalAverage: "2.1%"
        },
        {
          Name: "ADL Decline (Self-Care)",
          Weight: 1.0,
          Impact: "MEDIUM",
          Formula: "(Residents with decline / Eligible residents) * 100",
          Thresholds: {
            FiveStar: "< 10%",
            FourStar: "10-15%",
            ThreeStar: "15-20%",
            TwoStar: "20-25%",
            OneStar: "> 25%"
          },
          NationalAverage: "16.2%"
        },
        {
          Name: "Depressive Symptoms",
          Weight: 1.0,
          Impact: "MEDIUM",
          Formula: "(Residents with symptoms / Eligible residents) * 100",
          Thresholds: {
            FiveStar: "< 3%",
            FourStar: "3-5%",
            ThreeStar: "5-8%",
            TwoStar: "8-12%",
            OneStar: "> 12%"
          },
          NationalAverage: "5.8%"
        }
      ],

      ShortStayMeasuresList: [
        {
          Name: "Pressure Ulcers (New or Worsened)",
          Weight: 2.5,
          Impact: "HIGH",
          RiskAdjusted: true,
          Thresholds: {
            FiveStar: "< 0.5%",
            FourStar: "0.5-1.5%",
            ThreeStar: "1.5-3.0%",
            TwoStar: "3.0-5.0%",
            OneStar: "> 5.0%"
          },
          NationalAverage: "1.8%"
        },
        {
          Name: "Falls with Major Injury",
          Weight: 2.0,
          Impact: "HIGH",
          Thresholds: {
            FiveStar: "< 0.3%",
            FourStar: "0.3-0.8%",
            ThreeStar: "0.8-1.5%",
            TwoStar: "1.5-2.5%",
            OneStar: "> 2.5%"
          },
          NationalAverage: "1.2%"
        },
        {
          Name: "Functional Improvement",
          Weight: 2.0,
          Impact: "HIGH",
          RiskAdjusted: true,
          Notes: "Higher is better - percentage who improved in function",
          Thresholds: {
            FiveStar: "> 75%",
            FourStar: "65-75%",
            ThreeStar: "55-65%",
            TwoStar: "45-55%",
            OneStar: "< 45%"
          },
          NationalAverage: "62%"
        },
        {
          Name: "Rehospitalizations",
          Weight: 1.5,
          Impact: "MEDIUM",
          RiskAdjusted: true,
          Formula: "30-day all-cause rehospitalization rate",
          Thresholds: {
            FiveStar: "< 18%",
            FourStar: "18-22%",
            ThreeStar: "22-26%",
            TwoStar: "26-32%",
            OneStar: "> 32%"
          },
          NationalAverage: "23%"
        },
        {
          Name: "ED Visits",
          Weight: 1.5,
          Impact: "MEDIUM",
          RiskAdjusted: true,
          Formula: "Outpatient ED visits per 1,000 days",
          Thresholds: {
            FiveStar: "< 1.5",
            FourStar: "1.5-2.5",
            ThreeStar: "2.5-4.0",
            TwoStar: "4.0-6.0",
            OneStar: "> 6.0"
          },
          NationalAverage: "3.2"
        }
      ],

      StarCutPoints: [
        { Stars: 5, ScoreRange: "805-1005", Description: "Top 10% performance" },
        { Stars: 4, ScoreRange: "645-804", Description: "Above average" },
        { Stars: 3, ScoreRange: "485-644", Description: "Average" },
        { Stars: 2, ScoreRange: "325-484", Description: "Below average" },
        { Stars: 1, ScoreRange: "0-324", Description: "Poor performance" }
      ],

      ToppedOutMeasures: [
        "Flu Vaccination",
        "Pneumococcal Vaccination",
        "Residents with Excessive Weight Loss",
        "Residents with Feeding Tubes",
        "Assessment of Pain"
      ]
    },

    Overall: {
      Integration: "Health Inspection stars serve as the base, then Staffing and QM adjustments applied",
      CalculationMethod: [
        "Step 1: Start with Health Inspection star rating as base",
        "Step 2: Add points based on Staffing performance (up to +150)",
        "Step 3: Add points based on QM performance (up to +150)",
        "Step 4: Convert total points to final Overall star rating",
        "Step 5: Apply caps and Special Focus Facility rules"
      ],
      Caps: [
        "1-star Staffing limits Overall to 1 star (pre-2023)",
        "Low RN hours caps Overall at 3 stars",
        "If both Staffing and QM are low, Overall capped at 3 stars (2023+)",
        "Special Focus Facilities (SFFs) limited to 1 star"
      ],
      PointConversion: [
        { TotalPoints: "300+", OverallStars: 5 },
        { TotalPoints: "240-299", OverallStars: 4 },
        { TotalPoints: "180-239", OverallStars: 3 },
        { TotalPoints: "120-179", OverallStars: 2 },
        { TotalPoints: "0-119", OverallStars: 1 }
      ]
    }
  },

  ImprovementStrategies: {
    EffectivePaths: [
      {
        FromTo: "1-2",
        Focus: "Address critical deficiencies and basic staffing",
        Timeline: "6-12 months",
        KeyActions: [
          "Conduct mock surveys to identify citation-prone areas",
          "Fix infection control protocols (most common citation category)",
          "Ensure minimum staffing levels (target 3.5+ total HPRD)",
          "Implement QAPI (Quality Assurance Performance Improvement) framework",
          "Root-cause analysis of all deficiencies",
          "Staff training on documentation"
        ],
        ExpectedImpact: "15-25 point improvement in inspection scores"
      },
      {
        FromTo: "2-3",
        Focus: "Optimize QMs via targeted interventions and MDS accuracy",
        Timeline: "6-12 months",
        KeyActions: [
          "Audit MDS coding for accuracy (errors can drop scores 10-20%)",
          "Implement fall prevention programs (Tai Chi, hourly rounding)",
          "Reduce catheter use through protocol review",
          "Begin antipsychotic reduction program",
          "Focus on high-weight QMs first",
          "Track progress weekly"
        ],
        ExpectedImpact: "50-100 point improvement in QM scores"
      },
      {
        FromTo: "3-4",
        Focus: "Staff retention, technology, and systematic improvement",
        Timeline: "12-18 months",
        KeyActions: [
          "Implement culture surveys and act on feedback",
          "Introduce retention bonuses and career ladders",
          "Deploy EHR for better data tracking and MDS accuracy",
          "Benchmark against peer facilities using CMS data",
          "Address weekday vs weekend staffing gaps (new 2023 requirement)",
          "Reduce turnover below 50% threshold"
        ],
        ExpectedImpact: "Move to upper quartile in multiple domains"
      },
      {
        FromTo: "4-5",
        Focus: "Sustained excellence and continuous monitoring",
        Timeline: "Ongoing (12+ months to achieve, continuous to maintain)",
        KeyActions: [
          "Join quality collaboratives (e.g., AHCA Quality Initiative)",
          "Implement real-time QM tracking dashboards",
          "Monthly peer benchmarking",
          "Zero-tolerance culture for safety issues",
          "Proactive infection control",
          "Advanced dementia care programs"
        ],
        ExpectedImpact: "Maintain top 10% performance in all domains"
      }
    ],

    CostEffectiveTactics: [
      {
        Category: "Low-Cost",
        CostRange: "Under $10K/year",
        Examples: [
          "Policy standardization (hourly rounding protocols) - FREE",
          "Use free CMS webinars for staff training",
          "MDS accuracy checklists for coders - FREE",
          "Non-monetary staff perks (flexible shifts, recognition)",
          "Volunteer programs for resident engagement",
          "Partner with QIO for free technical assistance"
        ],
        ROI: "High - 10-20% score boost possible",
        ImpactAreas: ["QM scores", "Deficiency reduction", "Staff morale"]
      },
      {
        Category: "Medium-Cost",
        CostRange: "$10K-$50K/year",
        Examples: [
          "Basic EHR/tech tools (PointClickCare basic ~$5K setup)",
          "Part-time consultant for inspection prep (~$2K per review)",
          "Targeted training programs for clinical staff",
          "Quality improvement software",
          "Audit and compliance tools"
        ],
        ROI: "Medium - 5-15% score boost",
        ImpactAreas: ["Staffing scores", "Overall rating"]
      }
    ],

    AvoidPitfalls: [
      "Over-relying on agency staff (expensive and high turnover)",
      "Mass hiring without retention strategy",
      "Ignoring MDS coding accuracy",
      "Reactive rather than proactive quality improvement",
      "Underinvesting in infection control",
      "Neglecting weekend staffing (new 2023 requirement)"
    ],

    ToolsAndResources: [
      "QAPI framework for root-cause analysis",
      "iQIES (internet Quality Improvement and Evaluation System) for rating previews",
      "QIO (Quality Improvement Organization) free consulting",
      "CMS YouTube channel tutorials",
      "AHCA Quality Initiative programs"
    ],

    EvidenceBase: {
      Study: "Abt Associates (2020): 1-2 star gains via targeted interventions",
      ROI: "Per AHCA data, 1-star improvement yields $50K+ annual revenue from better referrals",
      StaffingROI: "Staffing investments return 2-3x via lower penalties and reduced turnover costs"
    }
  },

  Resources: {
    OfficialCMS: [
      {
        Title: "Technical Users' Guide (July 2023)",
        URL: "https://www.cms.gov/files/document/five-star-users-guide-july-2023.pdf",
        Type: "PDF",
        Description: "Complete methodology documentation (100+ pages)"
      },
      {
        Title: "Star Rating Cut Points",
        URL: "https://www.cms.gov/medicare/provider-enrollment-and-certification/certificationandcomplianc/downloads/cutpointtable.pdf",
        Type: "PDF",
        Description: "Quarterly updated star thresholds"
      },
      {
        Title: "Design for Care Compare (2023)",
        URL: "https://www.cms.gov/files/document/design-nursing-home-compare-five-star-quality-rating-system-technical-users-guide-april-2023.pdf",
        Type: "PDF",
        Description: "Technical guide for rating system design"
      },
      {
        Title: "Care Compare Website",
        URL: "https://www.medicare.gov/care-compare/",
        Type: "Website",
        Description: "Public-facing ratings lookup tool"
      }
    ],
    GuidesAndTools: [
      {
        Title: "AHCA Quality Improvement Resources",
        URL: "https://www.ahcancal.org/Quality/Pages/default.aspx",
        Type: "Website",
        Description: "Industry association quality improvement tools"
      },
      {
        Title: "QIO Program Directory",
        URL: "https://qioprogram.org/locate-your-qio",
        Type: "Directory",
        Description: "Find your regional Quality Improvement Organization"
      },
      {
        Title: "PBJ Policy Manual",
        URL: "https://www.cms.gov/files/document/pbj-policy-manual-v-25.pdf",
        Type: "PDF",
        Description: "Staffing data submission requirements"
      },
      {
        Title: "National Nursing Home Quality Improvement Campaign",
        URL: "https://www.nhqualitycampaign.org/",
        Type: "Website",
        Description: "National quality improvement initiative"
      }
    ],
    ResearchAndStudies: [
      {
        Title: "GAO Report on Nursing Home Quality (2022)",
        URL: "https://www.gao.gov/assets/gao-22-105965.pdf",
        Type: "PDF",
        Description: "Government oversight analysis of the rating system"
      },
      {
        Title: "Journal of American Geriatrics Society: Cost-Effective Improvements (2021)",
        URL: "https://agsjournals.onlinelibrary.wiley.com/doi/full/10.1111/jgs.17345",
        Type: "Article",
        Description: "Research on cost-effective quality improvement strategies"
      },
      {
        Title: "Health Affairs: Staffing and Outcomes (2018)",
        URL: "https://www.healthaffairs.org/doi/10.1377/hlthaff.2017.1382",
        Type: "Article",
        Description: "Research linking staffing levels to resident outcomes"
      }
    ],
    Datasets: [
      {
        Title: "Provider Info Dataset",
        URL: "https://data.cms.gov/provider-data/dataset/4pq5-n9py",
        Type: "CSV/Excel",
        Description: "Comprehensive provider-level data"
      },
      {
        Title: "MDS Quality Measures Dataset",
        URL: "https://data.cms.gov/provider-data/dataset/yqxx-xp2f",
        Type: "Downloadable",
        Description: "Quality measure performance data"
      }
    ],
    TrainingAndWebinars: [
      {
        Title: "CMS YouTube Channel: Five-Star Tutorials",
        URL: "https://www.youtube.com/user/CMSHHSgov/search?query=five+star",
        Type: "Videos",
        Description: "Free video training on rating system"
      }
    ]
  },

  References: {
    AllSources: "Compiled from CMS official documents, peer-reviewed journals, and industry associations. Last updated based on 2023-2024 data.",
    KeyCitations: [
      "CMS Five-Star Quality Rating System: Technical Users' Guide (July 2023)",
      "GAO Report on Nursing Home Quality (GAO-22-105965)",
      "AHCA Quality Resources",
      "Health Affairs: Staffing Impacts (2018)",
      "CMS PBJ Policy Manual v2.5"
    ]
  }
};

// ============================================
// KNOWLEDGE QUERY FUNCTIONS
// ============================================

export interface KnowledgeQueryResult {
  topic: string;
  content: any;
  relevance: number;
  sources: string[];
}

/**
 * Query the Five-Star knowledge base by topic
 */
export function queryKnowledge(topic: string): KnowledgeQueryResult | null {
  const lowerTopic = topic.toLowerCase();

  // Health Inspections
  if (lowerTopic.includes('health inspection') || lowerTopic.includes('survey') || lowerTopic.includes('deficien')) {
    return {
      topic: 'Health Inspections Domain',
      content: FiveStarDataset.Domains.HealthInspections,
      relevance: 1.0,
      sources: ['CMS Technical Users Guide (July 2023)']
    };
  }

  // Staffing
  if (lowerTopic.includes('staff') || lowerTopic.includes('hprd') || lowerTopic.includes('rn hour') || lowerTopic.includes('pbj')) {
    return {
      topic: 'Staffing Domain',
      content: FiveStarDataset.Domains.Staffing,
      relevance: 1.0,
      sources: ['CMS PBJ Policy Manual', 'CMS Technical Users Guide']
    };
  }

  // Quality Measures
  if (lowerTopic.includes('quality measure') || lowerTopic.includes('qm') || lowerTopic.includes('mds')) {
    return {
      topic: 'Quality Measures Domain',
      content: FiveStarDataset.Domains.QualityMeasures,
      relevance: 1.0,
      sources: ['CMS Technical Users Guide', 'MDS 3.0 Manual']
    };
  }

  // Specific QMs
  if (lowerTopic.includes('fall')) {
    const longStay = FiveStarDataset.Domains.QualityMeasures.LongStayMeasuresList.find(m => m.Name.includes('Falls'));
    const shortStay = FiveStarDataset.Domains.QualityMeasures.ShortStayMeasuresList.find(m => m.Name.includes('Falls'));
    return {
      topic: 'Falls Quality Measure',
      content: { longStay, shortStay, actionPlan: getActionPlan('falls') },
      relevance: 1.0,
      sources: ['CMS Quality Measures Technical Specifications']
    };
  }

  if (lowerTopic.includes('pressure') || lowerTopic.includes('ulcer') || lowerTopic.includes('wound')) {
    const longStay = FiveStarDataset.Domains.QualityMeasures.LongStayMeasuresList.find(m => m.Name.includes('Pressure'));
    const shortStay = FiveStarDataset.Domains.QualityMeasures.ShortStayMeasuresList.find(m => m.Name.includes('Pressure'));
    return {
      topic: 'Pressure Ulcers Quality Measure',
      content: { longStay, shortStay, actionPlan: getActionPlan('pressure') },
      relevance: 1.0,
      sources: ['CMS Quality Measures Technical Specifications']
    };
  }

  if (lowerTopic.includes('uti') || lowerTopic.includes('urinary') || lowerTopic.includes('infection')) {
    const measure = FiveStarDataset.Domains.QualityMeasures.LongStayMeasuresList.find(m => m.Name.includes('UTI'));
    return {
      topic: 'UTI Quality Measure',
      content: { measure, actionPlan: getActionPlan('uti') },
      relevance: 1.0,
      sources: ['CMS Quality Measures Technical Specifications']
    };
  }

  if (lowerTopic.includes('antipsychotic') || lowerTopic.includes('medication')) {
    const measure = FiveStarDataset.Domains.QualityMeasures.LongStayMeasuresList.find(m => m.Name.includes('Antipsychotic'));
    return {
      topic: 'Antipsychotic Use Quality Measure',
      content: { measure, actionPlan: getActionPlan('antipsychotic') },
      relevance: 1.0,
      sources: ['CMS Quality Measures Technical Specifications']
    };
  }

  // Overall Rating
  if (lowerTopic.includes('overall') || lowerTopic.includes('calculate') || lowerTopic.includes('star rating')) {
    return {
      topic: 'Overall Star Rating Calculation',
      content: FiveStarDataset.Domains.Overall,
      relevance: 1.0,
      sources: ['CMS Technical Users Guide (July 2023)']
    };
  }

  // Improvement Strategies
  if (lowerTopic.includes('improve') || lowerTopic.includes('strategy') || lowerTopic.includes('action plan')) {
    return {
      topic: 'Improvement Strategies',
      content: FiveStarDataset.ImprovementStrategies,
      relevance: 1.0,
      sources: ['Abt Associates (2020)', 'AHCA Quality Resources']
    };
  }

  // Cost-effective improvements
  if (lowerTopic.includes('cost') || lowerTopic.includes('budget') || lowerTopic.includes('cheap') || lowerTopic.includes('affordable')) {
    return {
      topic: 'Cost-Effective Improvement Tactics',
      content: FiveStarDataset.ImprovementStrategies.CostEffectiveTactics,
      relevance: 1.0,
      sources: ['AHCA Quality Resources', 'Journal of American Geriatrics Society (2021)']
    };
  }

  // Resources
  if (lowerTopic.includes('resource') || lowerTopic.includes('reference') || lowerTopic.includes('guide')) {
    return {
      topic: 'Resources and References',
      content: FiveStarDataset.Resources,
      relevance: 1.0,
      sources: ['CMS', 'AHCA', 'GAO']
    };
  }

  // Overview
  if (lowerTopic.includes('overview') || lowerTopic.includes('what is') || lowerTopic.includes('explain')) {
    return {
      topic: 'Five-Star System Overview',
      content: FiveStarDataset.Overview,
      relevance: 1.0,
      sources: ['CMS Technical Users Guide (July 2023)']
    };
  }

  return null;
}

/**
 * Get detailed action plan for specific QM
 */
export function getActionPlan(measureType: string): string[] {
  const plans: Record<string, string[]> = {
    falls: [
      "1. Implement hourly rounding protocols with documentation",
      "2. Install bed/chair sensor alarms for high-risk residents",
      "3. Monthly medication review for fall-risk drugs (benzodiazepines, opioids, antihypertensives)",
      "4. Ensure adequate lighting in all areas, especially at night",
      "5. Require non-slip footwear for all ambulatory residents",
      "6. Physical therapy for balance and strength training",
      "7. Hip protectors for residents with history of falls",
      "8. Environmental audit for trip hazards monthly"
    ],
    pressure: [
      "1. Reposition immobile residents every 2 hours with documentation",
      "2. Use pressure-redistributing mattresses and cushions",
      "3. Keep skin clean and dry with proper incontinence management",
      "4. Ensure adequate nutrition (protein >1.2g/kg, vitamin C, zinc)",
      "5. Daily skin assessments by trained staff",
      "6. Document turning schedules and compliance",
      "7. Use heel protectors and specialty beds for high-risk patients",
      "8. Weekly wound rounds with certified wound nurse"
    ],
    uti: [
      "1. Minimize catheter use - remove as soon as medically appropriate",
      "2. Maintain strict catheter care protocols with daily review",
      "3. Ensure hydration (8+ glasses daily) with tracking",
      "4. Proper perineal hygiene with staff training",
      "5. Cranberry supplementation where clinically appropriate",
      "6. Monitor for early UTI symptoms (confusion, fever, frequency)",
      "7. Staff education on infection prevention techniques",
      "8. Review and reduce antibiotic overuse"
    ],
    antipsychotic: [
      "1. Implement behavioral interventions before medications",
      "2. Use person-centered dementia care approaches",
      "3. Gradual dose reduction protocols with monitoring",
      "4. Regular medication reviews by consultant pharmacist",
      "5. Staff training on non-pharmacological interventions",
      "6. Document behaviors and alternatives tried before prescribing",
      "7. Consult with geriatric psychiatry for complex cases",
      "8. Family education on behavioral approaches"
    ],
    catheter: [
      "1. Daily assessment of catheter necessity",
      "2. Use nurse-driven removal protocols",
      "3. Proper insertion technique training",
      "4. Maintain closed drainage system",
      "5. Secure catheter to prevent trauma",
      "6. Track catheter days as quality metric",
      "7. Consider alternatives (condom catheter, scheduled toileting)",
      "8. Infection surveillance program"
    ],
    restraint: [
      "1. Conduct individualized assessment before any restraint",
      "2. Use least restrictive alternatives first",
      "3. Environmental modifications to prevent falls",
      "4. Low beds and floor mats as alternatives",
      "5. One-on-one supervision when needed",
      "6. Regular review of all restraint orders",
      "7. Staff training on restraint-free care",
      "8. Family involvement in care planning"
    ]
  };

  return plans[measureType] || ["No specific action plan available for this measure type"];
}

/**
 * Calculate projected star rating based on QM performance
 */
export function calculateProjectedQMStars(measures: Record<string, number>): {
  totalPoints: number;
  starRating: number;
  breakdown: { measure: string; points: number; performance: string }[];
} {
  const breakdown: { measure: string; points: number; performance: string }[] = [];
  let totalPoints = 0;

  // Map measure names to thresholds and calculate points
  const measureConfigs = [
    { key: 'fallsLongStay', name: 'Falls with Major Injury (Long-Stay)', weight: 3.0, thresholds: [0.5, 1.0, 2.0, 3.5] },
    { key: 'pressureUlcers', name: 'Pressure Ulcers (High Risk)', weight: 2.5, thresholds: [2.0, 4.0, 7.0, 10.0] },
    { key: 'uti', name: 'Urinary Tract Infections', weight: 2.0, thresholds: [1.5, 3.0, 5.0, 7.5] },
    { key: 'antipsychotics', name: 'Antipsychotic Use', weight: 1.5, thresholds: [10, 15, 22, 30] },
    { key: 'restraints', name: 'Physical Restraints', weight: 1.5, thresholds: [0.1, 0.5, 1.0, 2.0] },
    { key: 'catheter', name: 'Catheter Use', weight: 1.5, thresholds: [1.0, 2.0, 4.0, 6.0] },
    { key: 'adlDecline', name: 'ADL Decline', weight: 1.0, thresholds: [10, 15, 20, 25] },
    { key: 'depression', name: 'Depressive Symptoms', weight: 1.0, thresholds: [3, 5, 8, 12] },
  ];

  for (const config of measureConfigs) {
    const value = measures[config.key];
    if (value === undefined) continue;

    let points = 20; // Base points
    let performance = '1 Star';

    if (value < config.thresholds[0]) {
      points = 100;
      performance = '5 Stars';
    } else if (value < config.thresholds[1]) {
      points = 80;
      performance = '4 Stars';
    } else if (value < config.thresholds[2]) {
      points = 60;
      performance = '3 Stars';
    } else if (value < config.thresholds[3]) {
      points = 40;
      performance = '2 Stars';
    }

    // Apply weight
    points = Math.round(points * config.weight / 2);
    totalPoints += points;

    breakdown.push({
      measure: config.name,
      points,
      performance
    });
  }

  // Determine star rating from total points
  let starRating = 1;
  if (totalPoints >= 805) starRating = 5;
  else if (totalPoints >= 645) starRating = 4;
  else if (totalPoints >= 485) starRating = 3;
  else if (totalPoints >= 325) starRating = 2;

  return { totalPoints, starRating, breakdown };
}

/**
 * Get improvement recommendations based on current performance
 */
export function getImprovementRecommendations(currentStars: number): {
  fromTo: string;
  focus: string[];
  timeline: string;
  priorityActions: string[];
  expectedROI: string;
} {
  const strategies = FiveStarDataset.ImprovementStrategies.EffectivePaths;

  if (currentStars === 1) {
    const strategy = strategies.find(s => s.FromTo === "1-2");
    return {
      fromTo: "1 to 2 Stars",
      focus: strategy?.KeyActions || [],
      timeline: strategy?.Timeline || "6-12 months",
      priorityActions: [
        "Conduct immediate mock survey",
        "Address infection control deficiencies",
        "Ensure minimum staffing (3.5+ HPRD)",
        "Implement QAPI framework"
      ],
      expectedROI: "Foundation for further improvement, reduced regulatory scrutiny"
    };
  }

  if (currentStars === 2) {
    const strategy = strategies.find(s => s.FromTo === "2-3");
    return {
      fromTo: "2 to 3 Stars",
      focus: strategy?.KeyActions || [],
      timeline: strategy?.Timeline || "6-12 months",
      priorityActions: [
        "Audit MDS coding for accuracy",
        "Implement fall prevention program",
        "Reduce catheter utilization",
        "Focus on high-weight QMs (falls, pressure ulcers)"
      ],
      expectedROI: "50-100 point QM improvement, better referrals"
    };
  }

  if (currentStars === 3) {
    const strategy = strategies.find(s => s.FromTo === "3-4");
    return {
      fromTo: "3 to 4 Stars",
      focus: strategy?.KeyActions || [],
      timeline: strategy?.Timeline || "12-18 months",
      priorityActions: [
        "Staff retention programs (reduce turnover below 50%)",
        "EHR implementation for better tracking",
        "Address weekend staffing gaps",
        "Benchmark against top performers"
      ],
      expectedROI: "Move to upper quartile, premium referral relationships"
    };
  }

  if (currentStars === 4) {
    const strategy = strategies.find(s => s.FromTo === "4-5");
    return {
      fromTo: "4 to 5 Stars",
      focus: strategy?.KeyActions || [],
      timeline: strategy?.Timeline || "12+ months",
      priorityActions: [
        "Join quality collaboratives",
        "Real-time QM dashboards",
        "Zero-tolerance safety culture",
        "Advanced specialized care programs"
      ],
      expectedROI: "Top 10% performance, maximum referral premium, highest occupancy"
    };
  }

  return {
    fromTo: "Maintain 5 Stars",
    focus: ["Continuous monitoring", "Innovation in care delivery"],
    timeline: "Ongoing",
    priorityActions: [
      "Monthly benchmarking",
      "Proactive quality initiatives",
      "Staff development programs",
      "Community partnership building"
    ],
    expectedROI: "Sustained market leadership"
  };
}

/**
 * Search the knowledge base
 */
export function searchKnowledge(query: string): KnowledgeQueryResult[] {
  const results: KnowledgeQueryResult[] = [];
  const lowerQuery = query.toLowerCase();
  const terms = lowerQuery.split(' ').filter(t => t.length > 2);

  // Search through all sections
  const sections = [
    { key: 'overview', data: FiveStarDataset.Overview },
    { key: 'healthInspections', data: FiveStarDataset.Domains.HealthInspections },
    { key: 'staffing', data: FiveStarDataset.Domains.Staffing },
    { key: 'qualityMeasures', data: FiveStarDataset.Domains.QualityMeasures },
    { key: 'overall', data: FiveStarDataset.Domains.Overall },
    { key: 'improvementStrategies', data: FiveStarDataset.ImprovementStrategies },
    { key: 'resources', data: FiveStarDataset.Resources }
  ];

  for (const section of sections) {
    const sectionText = JSON.stringify(section.data).toLowerCase();
    const matchCount = terms.filter(term => sectionText.includes(term)).length;

    if (matchCount > 0) {
      results.push({
        topic: section.key,
        content: section.data,
        relevance: matchCount / terms.length,
        sources: ['CMS Five-Star Technical Guide']
      });
    }
  }

  // Sort by relevance
  return results.sort((a, b) => b.relevance - a.relevance);
}

// Export the complete dataset for direct access
export default FiveStarDataset;
