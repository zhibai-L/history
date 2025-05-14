import { extract } from '@/util/map_util';

function createObjectURLFromScript(code: string): string {
  return URL.createObjectURL(new Blob([code], { type: 'application/javascript' }));
}

class ScriptUrl {
  private map: Map<string, string> = new Map();

  public get(name: string): string | undefined {
    return this.map.get(name);
  }
  public set(name: string, code: string): void {
    this.map.set(name, createObjectURLFromScript(code));
  }
  public delete(name: string): string | undefined {
    const url = extract(this.map, name);
    if (!url) {
      return url;
    }
    URL.revokeObjectURL(url);
    return url;
  }
}

export const script_url = new ScriptUrl();
