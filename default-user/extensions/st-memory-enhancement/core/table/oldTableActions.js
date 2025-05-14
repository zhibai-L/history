import {BASE, DERIVED, EDITOR, SYSTEM, USER} from '../manager.js';

/**
 * 将单元格中的逗号替换为/符号
 * @param {string | number} cell
 * @returns 处理后的单元格值
 */
function handleCellValue(cell) {
    if (typeof cell === 'string') {
        return cell.replace(/,/g, "/")
    } else if (typeof cell === 'number') {
        return cell
    }
    return ''
}

/**
 * 在表格末尾插入行
 * @deprecated
 * @param {number} tableIndex 表格索引
 * @param {object} data 插入的数据
 * @returns 新插入行的索引
 */
export function insertRow(tableIndex, data) {
    if (tableIndex == null) return EDITOR.error('insert函数，tableIndex函数为空');
    if (data == null) return EDITOR.error('insert函数，data函数为空');

    // 获取表格对象，支持新旧系统
    const table = DERIVED.any.waitingTable[tableIndex];

    // 检查是否为新系统的Sheet对象
    if (table.uid && table.hashSheet) {
        // 新系统：使用Sheet类API
        try {
            // 获取当前行数（不包括表头）
            const rowCount = table.hashSheet.length - 1;

            // 在最后一行后面插入新行
            const cell = table.findCellByPosition(0, 0); // 获取表格源单元格
            cell.newAction('insertDownRow'); // 在最后一行后插入新行

            // 填充数据
            Object.entries(data).forEach(([key, value]) => {
                const colIndex = parseInt(key) + 1; // +1 因为第一列是行索引
                if (colIndex < table.hashSheet[0].length) {
                    const cell = table.findCellByPosition(rowCount + 1, colIndex);
                    if (cell) {
                        cell.data.value = handleCellValue(value);
                    }
                }
            });

            console.log(`插入成功: table ${tableIndex}, row ${rowCount + 1}`);
            return rowCount + 1;
        } catch (error) {
            console.error('插入行失败:', error);
            return -1;
        }
    } else {
        // 旧系统：保持原有逻辑
        const newRow = Object.entries(data)
            .reduce((row, [key, value]) => {
                row[parseInt(key)] = handleCellValue(value);
                return row;
            }, new Array(table.columns.length).fill(""));
        const dataStr = JSON.stringify(newRow);
        // 检查是否已存在相同行
        if (table.content.some(row => JSON.stringify(row) === dataStr)) {
            console.log(`跳过重复插入: table ${tableIndex}, data ${dataStr}`);
            return -1; // 返回-1表示未插入
        }
        const newRowIndex = table.insert(data);
        console.log(`插入成功: table ${tableIndex}, row ${newRowIndex}`);
        return newRowIndex;
    }
}

/**
 * 删除行
 * @deprecated
 * @param {number} tableIndex 表格索引
 * @param {number} rowIndex 行索引
 */
export function deleteRow(tableIndex, rowIndex) {
    if (tableIndex == null) return EDITOR.error('delete函数，tableIndex函数为空');
    if (rowIndex == null) return EDITOR.error('delete函数，rowIndex函数为空');

    // 获取表格对象，支持新旧系统
    const table = DERIVED.any.waitingTable[tableIndex];

    // 检查是否为新系统的Sheet对象
    if (table.uid && table.hashSheet) {
        // 新系统：使用Sheet类API
        try {
            // 确保行索引有效（考虑表头行）
            const actualRowIndex = rowIndex + 1; // +1 因为第一行是表头

            // 检查行索引是否有效
            if (actualRowIndex >= table.hashSheet.length || actualRowIndex <= 0) {
                console.error(`无效的行索引: ${rowIndex}`);
                return;
            }

            // 获取要删除行的单元格并触发删除操作
            const cell = table.findCellByPosition(actualRowIndex, 0);
            if (cell) {
                cell.newAction('deleteSelfRow');
                console.log(`删除成功: table ${tableIndex}, row ${rowIndex}`);
            } else {
                console.error(`未找到行: ${rowIndex}`);
            }
        } catch (error) {
            console.error('删除行失败:', error);
        }
    } else {
        // 旧系统：保持原有逻辑
        table.delete(rowIndex);
    }
}

/**
 * 更新单个行的信息
 * @deprecated
 * @param {number} tableIndex 表格索引
 * @param {number} rowIndex 行索引
 * @param {object} data 更新的数据
 */
export function updateRow(tableIndex, rowIndex, data) {
    if (tableIndex == null) return EDITOR.error('update函数，tableIndex函数为空');
    if (rowIndex == null) return EDITOR.error('update函数，rowIndex函数为空');
    if (data == null) return EDITOR.error('update函数，data函数为空');

    // 获取表格对象，支持新旧系统
    const table = DERIVED.any.waitingTable[tableIndex];

    // 检查是否为新系统的Sheet对象
    if (table.uid && table.hashSheet) {
        // 新系统：使用Sheet类API
        try {
            // 确保行索引有效（考虑表头行）
            const actualRowIndex = rowIndex + 1; // +1 因为第一行是表头

            // 检查行索引是否有效
            if (actualRowIndex >= table.hashSheet.length || actualRowIndex <= 0) {
                console.error(`无效的行索引: ${rowIndex}`);
                return;
            }

            // 更新行数据
            Object.entries(data).forEach(([key, value]) => {
                const colIndex = parseInt(key) + 1; // +1 因为第一列是行索引
                if (colIndex < table.hashSheet[0].length) {
                    const cell = table.findCellByPosition(actualRowIndex, colIndex);
                    if (cell) {
                        cell.data.value = handleCellValue(value);
                    }
                }
            });

            // 保存更改
            table.save();
            console.log(`更新成功: table ${tableIndex}, row ${rowIndex}`);
        } catch (error) {
            console.error('更新行失败:', error);
        }
    } else {
        // 旧系统：保持原有逻辑
        table.update(rowIndex, data);
    }
}
