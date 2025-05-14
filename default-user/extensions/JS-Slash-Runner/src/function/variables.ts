import { getCharacterScriptVariables, replaceCharacterScriptVariables } from '@/component/script_repository/data';
import { getChatMessages, setChatMessages } from '@/function/chat_message';

import { chat, chat_metadata, saveMetadata, saveSettings } from '@sillytavern/script';
import { extension_settings } from '@sillytavern/scripts/extensions';

interface VariableOption {
  type?: 'message' | 'chat' | 'character' | 'global';
  message_id?: number | 'latest';
}

function getVariablesByType({ type = 'chat', message_id = 'latest' }: VariableOption): Record<string, any> {
  switch (type) {
    case 'message': {
      if (message_id !== 'latest' && (message_id < -chat.length || message_id >= chat.length)) {
        throw Error(`提供的 message_id(${message_id}) 超出了聊天消息楼层号范围`);
      }
      message_id = message_id === 'latest' ? -1 : message_id;
      return getChatMessages(message_id)[0].data;
    }
    case 'chat': {
      const metadata = chat_metadata as {
        variables: Record<string, any> | undefined;
      };
      if (!metadata.variables) {
        metadata.variables = {};
      }
      return metadata.variables;
    }
    case 'character': {
      return getCharacterScriptVariables();
    }
    case 'global':
      return extension_settings.variables.global;
  }
}

export function getVariables({ type = 'chat', message_id = 'latest' }: VariableOption = {}): Record<string, any> {
  const result = getVariablesByType({ type, message_id });

  console.info(`获取${type == 'chat' ? `聊天` : `全局`}变量表:\n${JSON.stringify(result)}`);
  return structuredClone(result);
}

export async function replaceVariables(
  variables: Record<string, any>,
  { type = 'chat', message_id = 'latest' }: VariableOption = {},
): Promise<void> {
  switch (type) {
    case 'message':
      if (message_id !== 'latest' && (message_id < -chat.length || message_id >= chat.length)) {
        throw Error(`提供的 message_id(${message_id}) 超出了聊天消息楼层号范围`);
      }
      message_id = message_id === 'latest' ? -1 : message_id;
      await setChatMessages([{ message_id, data: variables }], { refresh: 'none' });
      break;
    case 'chat':
      _.set(chat_metadata, 'variables', variables);
      await saveMetadata();
      break;
    case 'character':
      await replaceCharacterScriptVariables(variables);
      break;
    case 'global':
      _.set(extension_settings.variables, 'global', variables);
      await saveSettings();
      break;
  }

  console.info(
    `将${
      type === 'message' ? '消息' : type === 'chat' ? '聊天' : type === 'character' ? '角色' : '全局'
    }变量表替换为:\n${JSON.stringify(variables)}`,
  );
}

type VariablesUpdater =
  | ((variables: Record<string, any>) => Record<string, any>)
  | ((variables: Record<string, any>) => Promise<Record<string, any>>);

export async function updateVariablesWith(
  updater: VariablesUpdater,
  { type = 'chat', message_id = 'latest' }: VariableOption = {},
): Promise<Record<string, any>> {
  let variables = getVariables({ type, message_id });
  variables = await updater(variables);
  console.info(
    `对${
      type === 'message' ? '消息' : type === 'chat' ? '聊天' : type === 'character' ? '角色' : '全局'
    }变量表进行更新`,
  );
  await replaceVariables(variables, { type, message_id });
  return variables;
}

export async function insertOrAssignVariables(
  variables: Record<string, any>,
  { type = 'chat', message_id = 'latest' }: VariableOption = {},
): Promise<void> {
  await updateVariablesWith(old_variables => _.merge(old_variables, variables), { type, message_id });
}

export async function insertVariables(
  variables: Record<string, any>,
  { type = 'chat', message_id = 'latest' }: VariableOption = {},
): Promise<void> {
  await updateVariablesWith(old_variables => _.defaultsDeep(old_variables, variables), { type, message_id });
}

export async function deleteVariable(
  variable_path: string,
  { type = 'chat', message_id = 'latest' }: VariableOption = {},
): Promise<boolean> {
  let result: boolean = false;
  await updateVariablesWith(
    old_variables => {
      result = _.unset(old_variables, variable_path);
      return old_variables;
    },
    { type, message_id },
  );
  return result;
}
