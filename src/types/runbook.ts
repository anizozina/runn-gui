// Runbook type definitions based on runn specification

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS';

export interface HttpRunner {
  endpoint: string;
  skipVerify?: boolean;
  cert?: string;
  key?: string;
  cacert?: string;
  timeout?: string;
  retry?: {
    count?: number;
    interval?: string;
  };
  trace?: boolean;
  useCookie?: boolean;
  openApi3DocLocation?: string;
}

export type Runner = HttpRunner;

export interface HttpRequest {
  method: HttpMethod;
  path: string;
  headers?: Record<string, string>;
  body?: string | Record<string, any>;
  query?: Record<string, string | number | boolean>;
}

export interface TestCondition {
  condition: string;
  desc?: string;
}

export interface IncludeStep {
  path: string;
  vars?: Record<string, any>;
}

export interface Step {
  id: string;
  desc?: string;
  if?: string;
  loop?: {
    count?: number | string;
    until?: string;
  };
  req?: HttpRequest | Record<string, any>; // Can be standard format or runn format { "/path": { "method": {...} } }
  test?: TestCondition[] | string; // Can be array of conditions or single string condition
  include?: IncludeStep | string; // Can be object or string path
  bind?: {
    steps?: Record<string, any>;
    vars?: Record<string, any>;
    current?: Record<string, any>;
  };
}

export interface Runbook {
  desc?: string;
  labels?: string[];
  runners: Record<string, Runner>;
  vars?: Record<string, any>;
  steps: Step[];
  finally?: Step[]; // Cleanup steps
  debug?: boolean;
  skipTest?: boolean;
  skipIncluded?: boolean;
  interval?: string;
  loop?: {
    count?: number;
    interval?: string;
    until?: string;
  };
  skipDbinit?: boolean;
  needs?: Record<string, any>;
}

// Step type for step type selector
export type StepType = 'http' | 'include' | 'bind' | 'db' | 'grpc' | 'ssh' | 'cdp' | 'exec';
