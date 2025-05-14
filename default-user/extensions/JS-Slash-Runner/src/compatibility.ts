// for compatibility with old sillytavern versions
import { characters, this_chid } from '@sillytavern/script';
// @ts-ignore
import { selected_group } from '@sillytavern/scripts/group-chats';
import { getTagsList } from '@sillytavern/scripts/tags';
import { equalsIgnoreCaseAndAccents } from '@sillytavern/scripts/utils';
import { world_names } from '@sillytavern/scripts/world-info';

// for 1.12.6
/**
 * Finds a character by name, with optional filtering and precedence for avatars
 * @param {object} [options={}] - The options for the search
 * @param {string?} [options.name=null] - The name to search for
 * @param {boolean} [options.allowAvatar=true] - Whether to allow searching by avatar
 * @param {boolean} [options.insensitive=true] - Whether the search should be case insensitive
 * @param {string[]?} [options.filteredByTags=null] - Tags to filter characters by
 * @param {boolean} [options.preferCurrentChar=true] - Whether to prefer the current character(s)
 * @param {boolean} [options.quiet=false] - Whether to suppress warnings
 * @returns {any?} - The found character or null if not found
 */
export function findChar({
  name = null,
  allowAvatar = true,
  insensitive = true,
  filteredByTags = null,
  preferCurrentChar = true,
  quiet = false,
} = {}) {
  const matches = (char: any) =>
    !name ||
    (allowAvatar && char.avatar === name) ||
    (insensitive ? equalsIgnoreCaseAndAccents(char.name, name) : char.name === name);

  // Filter characters by tags if provided
  let filteredCharacters = characters;
  if (filteredByTags) {
    filteredCharacters = characters.filter(char => {
      const charTags = getTagsList(char.avatar, false);
      // @ts-ignore
      return filteredByTags.every(tagName => charTags.some(x => x.name == tagName));
    });
  }

  // Get the current character(s)
  /** @type {any[]} */
  // @ts-ignore
  const currentChars = (selected_group as any)
    ? // @ts-ignore
      groups
        // @ts-ignore
        .find(group => group.id === selected_group)
        // @ts-ignore
        ?.members.map(member => filteredCharacters.find(char => char.avatar === member))
    : // @ts-ignore
      filteredCharacters.filter(char => characters[this_chid]?.avatar === char.avatar);

  // If we have a current char and prefer it, return that if it matches
  if (preferCurrentChar) {
    const preferredCharSearch = currentChars.filter(matches);
    if (preferredCharSearch.length > 1) {
      // @ts-ignore
      if (!quiet) toastr.warning('Multiple characters found for given conditions.');
      else console.warn('Multiple characters found for given conditions. Returning the first match.');
    }
    if (preferredCharSearch.length) {
      return preferredCharSearch[0];
    }
  }

  // If allowAvatar is true, search by avatar first
  if (allowAvatar && name) {
    const characterByAvatar = filteredCharacters.find(char => char.avatar === name);
    if (characterByAvatar) {
      return characterByAvatar;
    }
  }

  // Search for matching characters by name
  const matchingCharacters = name ? filteredCharacters.filter(matches) : filteredCharacters;
  if (matchingCharacters.length > 1) {
    // @ts-ignore
    if (!quiet) toastr.warning('Multiple characters found for given conditions.');
    else console.warn('Multiple characters found for given conditions. Returning the first match.');
  }

  return matchingCharacters[0] || null;
}

/**
 * Reloads the editor with the specified world info file
 * @param file The file to load in the editor
 * @param loadIfNotSelected Indicates whether to load the file even if it's not currently selected
 */
export function reloadEditor(file: string, load_if_not_selected: boolean = false) {
  const current_index = Number($('#world_editor_select').val());
  const selected_index = world_names.indexOf(file);
  if (selected_index !== -1 && (load_if_not_selected || current_index === selected_index)) {
    $('#world_editor_select').val(selected_index).trigger('change');
  }
}

export const reloadEditorDebounced = _.debounce(reloadEditor, 1000);
