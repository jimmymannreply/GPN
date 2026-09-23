export interface LinkedInSimulation {
  headline: string;
  title: string;
  company: string;
  tenure: string;
  focusAreas: string[];
  simulated: true;
}

export interface AttendeeProfile {
  name: string;
  role: string;
  linkedIn: LinkedInSimulation;
}
