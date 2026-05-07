export type CVTrack = 'ops-lead' | 'product-owner' | 'technical-pm';

export interface Experience {
  title: string;
  company: string;
  period: string;
  bullets: string[];
}

export interface CVTemplate {
  id: string;
  track: CVTrack;
  candidateName: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  summary: string;
  competencies: string[];
  experience: Experience[];
  achievements: string[];
  education: { degree: string; institution: string; year: string }[];
  tools: Record<string, string[]>;
  languages: { language: string; level: string }[];
}

const candidateName = process.env.NEXT_PUBLIC_CANDIDATE_NAME ?? 'Evan Dharmasena';

export const cvTemplates: CVTemplate[] = [
  {
    id: 'ops-lead',
    track: 'ops-lead',
    candidateName,
    email: 'evan.dharmasena@gmail.com',
    phone: '+371 20 000 000',
    location: 'Riga, Latvia / London, UK',
    linkedin: 'linkedin.com/in/evandharmasena',
    summary:
      'Operational leader with 8+ years driving cross-functional delivery, vendor management, and process excellence across B2B SaaS and fintech environments. Proven ability to build and scale operations teams, implement OKR frameworks, and reduce cycle times through systematic process improvement. Comfortable operating at the intersection of strategy and execution in ambiguous, fast-moving environments.',
    competencies: [
      'Cross-functional team leadership',
      'Vendor & supplier management',
      'Process optimisation & lean methodologies',
      'OKR framework implementation',
      'Budget planning & cost management',
      'Stakeholder management & executive reporting',
      'Change management & transformation programmes',
      'SLA management & escalation handling',
      'Risk management & compliance',
      'Data-driven decision making',
      'Capacity planning & resource allocation',
      'Incident management & root cause analysis',
    ],
    experience: [
      {
        title: 'Senior Operations Manager',
        company: 'FinTech Scale Ltd',
        period: 'Jan 2022 – Present',
        bullets: [
          'Led a 25-person operations function spanning customer success, vendor relations, and internal tooling, achieving 98% SLA compliance across 12 enterprise accounts.',
          'Implemented OKR framework across 4 departments, improving goal alignment scores from 54% to 87% within two quarters.',
          'Reduced vendor onboarding cycle from 6 weeks to 11 days by redesigning the procurement workflow and introducing a self-serve portal.',
          'Managed a £2.1M operational budget, delivering 8% under forecast through proactive cost control and renegotiated SaaS contracts.',
          'Drove a cross-functional transformation programme that consolidated 3 legacy ops tools into a single platform, cutting operational overhead by 22%.',
          'Produced weekly executive dashboards tracking 14 KPIs; insights directly informed two strategic pivots approved at board level.',
        ],
      },
      {
        title: 'Operations Manager',
        company: 'LogiLink Europe',
        period: 'Mar 2019 – Dec 2021',
        bullets: [
          'Built the operations function from scratch for a Series B logistics startup, hiring and onboarding 12 team members in 6 months.',
          'Established incident management playbook and on-call rotation, reducing mean time to resolution from 4.2 hours to 47 minutes.',
          'Negotiated and managed contracts with 8 third-party logistics providers, maintaining 99.1% on-time delivery rate.',
          'Designed and rolled out a capacity planning model used to forecast headcount and infrastructure costs 6 months in advance.',
          'Collaborated with product and engineering to define internal tooling requirements; led UAT and rollout of 3 operational platforms.',
        ],
      },
      {
        title: 'Operations Analyst',
        company: 'RetailNow Group',
        period: 'Jun 2016 – Feb 2019',
        bullets: [
          'Analysed operational data across 40 retail locations to identify process bottlenecks, delivering recommendations that reduced stock discrepancy by 31%.',
          'Supported vendor performance reviews and monthly SLA reporting for 15 key suppliers.',
          'Coordinated change management communications for a company-wide ERP migration affecting 300+ staff.',
          'Maintained and improved operational dashboards in Excel and later Tableau, used by senior leadership weekly.',
        ],
      },
    ],
    achievements: [
      'Delivered £420K in annualised savings through vendor renegotiation and process automation at FinTech Scale Ltd.',
      'Awarded "Operational Excellence" recognition at LogiLink Europe two consecutive years.',
      'Reduced staff attrition in operations team from 28% to 11% through structured development pathways and improved on-call practices.',
      'Presented operational transformation strategy to board of directors; programme subsequently approved with full budget allocation.',
    ],
    education: [
      {
        degree: 'BSc Business Management (Operations)',
        institution: 'University of Leeds',
        year: '2016',
      },
    ],
    tools: {
      'Project & Ops': ['Jira', 'Confluence', 'Notion', 'Monday.com', 'Asana'],
      'Data & Reporting': ['Tableau', 'Looker', 'Excel', 'Google Sheets', 'SQL (basic)'],
      'Communication': ['Slack', 'Zoom', 'MS Teams', 'Google Workspace'],
      'Finance & Procurement': ['NetSuite', 'Coupa', 'QuickBooks'],
    },
    languages: [
      { language: 'English', level: 'Native' },
      { language: 'Latvian', level: 'Conversational' },
      { language: 'Russian', level: 'Intermediate' },
    ],
  },
  {
    id: 'product-owner',
    track: 'product-owner',
    candidateName,
    email: 'evan.dharmasena@gmail.com',
    phone: '+371 20 000 000',
    location: 'Riga, Latvia / London, UK',
    linkedin: 'linkedin.com/in/evandharmasena',
    summary:
      'Product Owner with 6+ years defining and delivering customer-facing and internal product features in agile B2B SaaS environments. Skilled in translating business strategy into prioritised backlogs, running discovery with real users, and shipping incrementally with measurable outcomes. Experienced working with distributed engineering and design teams across UK and EU time zones.',
    competencies: [
      'Backlog ownership & prioritisation (RICE, MoSCoW)',
      'User story writing & acceptance criteria',
      'Sprint planning & retrospective facilitation',
      'Stakeholder alignment & requirements gathering',
      'User research & usability testing',
      'Roadmap planning & OKR alignment',
      'API & integration product management',
      'Data analysis & funnel optimisation',
      'A/B testing & feature flag management',
      'Cross-functional collaboration (engineering, design, data)',
      'Customer journey mapping',
      'Release planning & go-to-market coordination',
    ],
    experience: [
      {
        title: 'Senior Product Owner',
        company: 'FinTech Scale Ltd',
        period: 'Jan 2022 – Present',
        bullets: [
          'Owned the end-to-end backlog for the B2B payments platform, managing 120+ user stories across 4 squads and shipping 3 major releases per quarter.',
          'Led discovery for a new merchant dashboard feature, conducting 18 user interviews and synthesising findings into a validated problem statement adopted by leadership.',
          'Increased sprint velocity by 34% by restructuring backlog refinement cadence and introducing a Definition of Ready checklist.',
          'Defined and tracked OKRs for the product squad, achieving 80% of KR targets in the first two cycles.',
          'Collaborated with engineering leads to define API contracts for a partner integration programme, enabling 6 third-party integrations to go live within 5 months.',
          'Reduced post-release defect rate by 41% through improved acceptance criteria and structured UAT with QA and CS teams.',
        ],
      },
      {
        title: 'Product Owner',
        company: 'LogiLink Europe',
        period: 'Mar 2019 – Dec 2021',
        bullets: [
          'Managed product backlog for an internal logistics management platform used by 200+ daily active users.',
          'Delivered a real-time shipment tracking feature end-to-end — from discovery through launch — in 11 weeks, reducing customer support tickets by 28%.',
          'Ran bi-weekly sprint ceremonies (planning, review, retro) for a team of 6 engineers and 2 designers.',
          'Introduced feature flags for all major releases, enabling progressive rollouts and reducing rollback incidents from 8 to 1 per quarter.',
          'Partnered with data team to establish product analytics dashboards tracking DAU, retention, and feature adoption.',
        ],
      },
      {
        title: 'Business Analyst',
        company: 'RetailNow Group',
        period: 'Jun 2016 – Feb 2019',
        bullets: [
          'Gathered and documented requirements for 5 internal systems across finance, HR, and operations.',
          'Facilitated workshops with 15+ business stakeholders to map as-is and to-be processes for a core ERP replacement.',
          'Wrote 60+ functional specifications reviewed and signed off by product and IT leads.',
          'Supported UAT coordination across 3 departments during a 6-month ERP rollout.',
        ],
      },
    ],
    achievements: [
      'Shipped merchant dashboard MVP in 8 weeks (vs. 14-week estimate) by cutting scope to validated must-haves and unblocking two engineering dependencies early.',
      'Improved Net Promoter Score for payments product from 32 to 51 over 12 months through continuous discovery and incremental delivery.',
      'Won internal "Product Impact" award at FinTech Scale Ltd for highest OKR attainment in 2023.',
      'Led migration of product team from waterfall to scrum, reducing average time-to-delivery from 9 weeks to 3.5 weeks.',
    ],
    education: [
      {
        degree: 'BSc Business Management (Operations)',
        institution: 'University of Leeds',
        year: '2016',
      },
    ],
    tools: {
      'Product & Agile': ['Jira', 'Confluence', 'Productboard', 'Linear', 'Notion'],
      'Design & Research': ['Figma', 'Maze', 'Hotjar', 'UserTesting', 'Miro'],
      'Data & Analytics': ['Amplitude', 'Mixpanel', 'Looker', 'Google Analytics', 'SQL (basic)'],
      'Delivery': ['GitHub', 'LaunchDarkly', 'Postman', 'Swagger'],
    },
    languages: [
      { language: 'English', level: 'Native' },
      { language: 'Latvian', level: 'Conversational' },
      { language: 'Russian', level: 'Intermediate' },
    ],
  },
  {
    id: 'technical-pm',
    track: 'technical-pm',
    candidateName,
    email: 'evan.dharmasena@gmail.com',
    phone: '+371 20 000 000',
    location: 'Riga, Latvia / London, UK',
    linkedin: 'linkedin.com/in/evandharmasena',
    summary:
      'Technical Programme Manager with 7+ years delivering complex, multi-workstream technology programmes across fintech and logistics. Comfortable bridging engineering and business: able to read API documentation, participate in architecture discussions, and translate technical constraints into business impact. Experienced with distributed teams, regulatory environments, and agile-at-scale delivery models.',
    competencies: [
      'Programme & project management (Agile, PRINCE2 concepts)',
      'Technical roadmap planning & dependency management',
      'API & systems integration oversight',
      'Risk & issue management (RAID logs)',
      'Stakeholder reporting & executive communication',
      'Engineering team coordination & velocity tracking',
      'Release & deployment governance',
      'Vendor & third-party technical management',
      'Data migration planning & oversight',
      'Architecture review participation',
      'Compliance & regulatory delivery (PSD2, GDPR)',
      'Budget & resource tracking',
    ],
    experience: [
      {
        title: 'Technical Programme Manager',
        company: 'FinTech Scale Ltd',
        period: 'Jan 2022 – Present',
        bullets: [
          'Led a PSD2 compliance programme across 6 workstreams and 3 engineering squads, delivering all regulatory milestones on time with zero enforcement findings.',
          'Coordinated a platform re-architecture programme spanning 18 months, managing dependencies across infrastructure, backend, and frontend teams.',
          'Maintained programme-level RAID logs and produced fortnightly steering committee reports consumed by CTO and CFO.',
          'Managed relationships with 4 third-party technical vendors, including API integration schedules and incident escalation paths.',
          'Introduced a release governance framework that reduced production incidents during deployments from 11 to 2 per quarter.',
          'Tracked and reported on engineering velocity across 4 squads, identifying blockers early and coordinating cross-team resolution.',
        ],
      },
      {
        title: 'Programme Manager',
        company: 'LogiLink Europe',
        period: 'Mar 2019 – Dec 2021',
        bullets: [
          'Ran a core platform migration programme (legacy monolith to microservices), coordinating 8 engineers across 4 domains over 14 months.',
          'Facilitated architecture decision records process, ensuring cross-squad awareness and sign-off on 12 major technical decisions.',
          'Managed third-party API integration programme with 5 logistics carriers, from contract through to production cutover.',
          'Defined and monitored programme KPIs including deployment frequency, change failure rate, and MTTR, aligned to DORA metrics.',
          'Produced weekly programme status reports for founder and board, flagging risks and dependencies with recommended mitigations.',
        ],
      },
      {
        title: 'Project Coordinator / Business Analyst',
        company: 'RetailNow Group',
        period: 'Jun 2016 – Feb 2019',
        bullets: [
          'Coordinated a 6-month ERP replacement programme across finance, HR, and operations, tracking milestones and managing stakeholder communications.',
          'Supported technical requirements gathering for system integrations involving 3 external vendors.',
          'Maintained project plans, risk registers, and change logs for 4 concurrent projects with a combined budget of £600K.',
          'Liaised with IT infrastructure team to plan data migration windows and rollback procedures for the ERP cutover.',
        ],
      },
    ],
    achievements: [
      'Delivered PSD2 compliance across all product areas 6 weeks ahead of regulatory deadline, avoiding potential £2M+ fine.',
      'Reduced deployment-related production incidents by 82% through release governance framework introduced at FinTech Scale Ltd.',
      'Completed platform re-architecture on schedule despite 3 scope changes and a team restructure mid-programme.',
      'Recognised by CTO for stakeholder communication quality and risk transparency during the platform migration programme.',
    ],
    education: [
      {
        degree: 'BSc Business Management (Operations)',
        institution: 'University of Leeds',
        year: '2016',
      },
    ],
    tools: {
      'Programme Management': ['Jira', 'Confluence', 'Monday.com', 'Smartsheet', 'MS Project'],
      'Technical': ['GitHub', 'Postman', 'Swagger', 'Datadog', 'PagerDuty'],
      'Data & Reporting': ['Looker', 'Tableau', 'Excel', 'Google Sheets', 'SQL (basic)'],
      'Communication': ['Slack', 'Zoom', 'MS Teams', 'Notion'],
    },
    languages: [
      { language: 'English', level: 'Native' },
      { language: 'Latvian', level: 'Conversational' },
      { language: 'Russian', level: 'Intermediate' },
    ],
  },
];

export function getTemplateByTrack(track: CVTrack): CVTemplate | undefined {
  return cvTemplates.find((t) => t.track === track);
}

export function getAllTemplateSummaries() {
  return cvTemplates.map((t) => ({
    id: t.id,
    track: t.track,
    summary: t.summary,
    competencies: t.competencies,
  }));
}
