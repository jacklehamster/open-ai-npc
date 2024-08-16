import { DbApi } from "@dobuki/data-client";
import { GithubApi } from "@the-brains/github-db";
import { Lock, NoLock, executeWithLock } from "@dobuki/code-lock";

export const OWNER = "jacklehamster";
export const REPO = "power-troll-levels";

interface Props {
  owner?: string;
  repo?: string;
  lock?: Lock;
}

export class GithubDb implements DbApi {
  githubApi: GithubApi;
  lock: Lock
  constructor({ owner = OWNER, repo = REPO, lock = new NoLock() }: Props) {
    this.lock = lock;
    this.githubApi = new GithubApi({
      username: owner,
      organizationName: owner,
      databaseStorageRepoName: repo,
      authToken: process.env.GITHUBDB_TOKEN ?? "",
    });
  }

  listKeys(keyprefix?: string, branch?: string, recursive?: boolean): Promise<any> {
    return this.githubApi.listKeys(keyprefix, branch, recursive);
  }

  getData(key: string): Promise<{ data: any; type?: string; sha: string | null; }> {
    return this.githubApi.getData(key);
  }
  setData(key: string, valueOrCall: any, options?: any): Promise<any> {
    return executeWithLock(this.lock, () => {
      return this.githubApi.setData(key, valueOrCall, options);
    }, key);
  }
}
