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

export interface GrpcRunner {
  addr: string;
  tls?: boolean;
  skipVerify?: boolean;
  cert?: string;
  key?: string;
  cacert?: string;
  timeout?: string;
  bufDirs?: string[];
  protos?: string[];
  importPaths?: string[];
}

export interface DbRunner {
  dsn: string;
  driver?: string;
}

export interface CdpRunner {
  addr?: string;
  timeout?: string;
}

export interface SshRunner {
  host: string;
  user?: string;
  key?: string;
  password?: string;
  port?: number;
  timeout?: string;
}

export type Runner = HttpRunner | GrpcRunner | DbRunner | CdpRunner | SshRunner;

export interface HttpRequest {
  method: HttpMethod;
  path: string;
  headers?: Record<string, string>;
  body?: string | Record<string, any>;
  query?: Record<string, string | number | boolean>;
}

export interface GrpcRequest {
  method: string;
  message?: Record<string, any>;
  metadata?: Record<string, string>;
}

export interface DbQuery {
  query: string;
  args?: any[];
}

export interface CdpAction {
  actions: Array<{
    navigate?: string;
    click?: string;
    screenshot?: string;
    wait?: number;
    [key: string]: any;
  }>;
}

export interface SshCommand {
  command: string;
}

export type StepRequest =
  | { req: HttpRequest }
  | { grpcRequest: GrpcRequest }
  | { db: DbQuery }
  | { cdp: CdpAction }
  | { ssh: SshCommand }
  | { exec: SshCommand };

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
  grpcRequest?: GrpcRequest;
  db?: DbQuery;
  cdp?: CdpAction;
  ssh?: SshCommand;
  exec?: SshCommand;
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

export interface RunbookProject {
  runbooks: Runbook[];
  activeRunbookIndex: number;
}
