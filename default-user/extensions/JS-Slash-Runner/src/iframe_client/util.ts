/**
 * 获取 iframe 的名称
 *
 * @returns 对于楼层消息是 `message-iframe-楼层id-是该楼层第几个iframe`; 对于全局脚本是 `script-iframe-脚本名称`; 对于脚本库是 `tavern-helper-script-脚本名称`
 */
function getIframeName(): string {
  return (window.frameElement as Element).id;
}

/**
 * 获取脚本库的 id, **只能对脚本库使用**
 *
 * @returns 脚本库的 id
 */
function getScriptId(): string {
  return $(window.frameElement as Element).attr('script-id') ?? 'unknown_script';
}

/**
 * 获取本消息楼层 iframe 所在楼层的楼层 id, **只能对楼层消息 iframe** 使用
 *
 * @returns 楼层 id
 */
function getCurrentMessageId(): number {
  return getMessageId(getIframeName());
}

/**
 * 从消息楼层 iframe 的 `iframe_name` 获取它所在楼层的楼层 id, **只能对楼层消息 iframe** 使用
 *
 * @param iframe_name 消息楼层 iframe 的名称
 * @returns 楼层 id
 */
function getMessageId(iframe_name: string): number {
  const match = iframe_name.match(/^message-iframe-(\d+)-\d+$/);
  if (!match) {
    throw Error(`获取 ${iframe_name} 所在楼层 id 时出错: 不要对全局脚本 iframe 调用 getMessageId!`);
  }
  return parseInt(match[1].toString());
}
