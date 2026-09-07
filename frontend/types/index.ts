export type Evidence={text:string;source:string;reference?:string};
export type Opportunity={title:string;summary:string;severity:string;impact:string;action:string;match:number;effort:string;relevant_files:string[];relevant_work_items:string[];why_you:string[];evidence:Evidence[]};
export type Dependency={id:string;name:string;version:string;status:string;used_in:string[];affected_services:string[]};
export type Insight={title:string;summary:string;severity:string;impact:string;action:string;evidence:Evidence[]};
export type Component={id:string;name:string;type:string;description:string;responsibilities:string[];dependencies:string[];dependents:string[];files:string[];coverage:number;recent_changes:number;risk?:string};
export type Expert={user:{id:string;name:string;role:string;skills:string[];experience_years:number;projects:string[]};relevance:number;reason:string;relevant_projects:string[];relevant_skills:string[]};

export type AskResponse={answer:string;evidence:Evidence[];suggested_actions:string[]};
