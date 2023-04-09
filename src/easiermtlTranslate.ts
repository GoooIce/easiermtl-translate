// const https = require("https");
// const crypto = require("crypto");
// const querystring = require("querystring");

import { workspace } from "vscode";
import { ITranslate, ITranslateOptions } from "comment-translate-manager";
import fetch from "node-fetch";

const PREFIXCONFIG = "easiermtlTranslate";

export function getConfig<T>(key: string): T | undefined {
  let configuration = workspace.getConfiguration(PREFIXCONFIG);
  return configuration.get<T>(key);
}

interface EasiermtlTranslateOption {
  url?: string;
}
// eslint-disable-next-line @typescript-eslint/naming-convention
interface _Response {
  translation: string;
  prediction: string;
}

export class EasiermtlTranslate implements ITranslate {
  get maxLen(): number {
    return 2000;
  }

  private _defaultOption: EasiermtlTranslateOption;
  constructor() {
    this._defaultOption = this.createOption();
    workspace.onDidChangeConfiguration(async (eventNames) => {
      if (eventNames.affectsConfiguration(PREFIXCONFIG)) {
        this._defaultOption = this.createOption();
      }
    });
  }

  createOption() {
    const defaultOption: EasiermtlTranslateOption = {
      url: getConfig<string>("url"),
    };
    return defaultOption;
  }

  async translate(
    content: string,
    { to = "auto", from = "auto" }: ITranslateOptions
  ) {
    const { url } = this._defaultOption;
    if (!url) {
      throw new Error("Please check the configuration of url!");
    }
    const data = {
      text: content,
    };
    const _url = `${url}/api/translate/english`;
    let res = await fetch(_url, { method: "post", body: JSON.stringify(data) });

    const resJson = (await res.json()) as unknown as _Response;
    return resJson.translation;
  }

  link(content: string, { to = "auto", from = "auto" }: ITranslateOptions) {
    let str = `https://easiermtl.com`;
    return `[easiermtl](${str})`;
  }

  isSupported(src: string) {
    return true;
  }
}
