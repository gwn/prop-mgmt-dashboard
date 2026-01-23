import {forwardRef, useState, useRef} from 'react'
import {Select, Button, Dialog} from '@radix-ui/themes'
import {readFile, parseAndValidateCSV} from '@/util'


const
    Input = forwardRef((
        {
            type = 'text',
            value,
            onChange,
            error,
            className = '',
            ...props
        },
        ref,
    ) =>
        <input
            ref={ref}
            type={type}
            value={value}
            className={className + ' ' + (error ? 'error' : '')}
            title={error}
            onChange={e =>
                onChange(
                    type === 'number'
                        ? parseFloat(e.target.value)
                        : e.target.value,
                )
            }
            {...props}
        />,
    ),


    FileInput = forwardRef((
        {
            value,
            error,
            onChange,
            className = '',
            ...props
        },
        ref,
    ) =>
        <input
            ref={ref}
            type='file'
            value={value}
            onChange={e => onChange(e.target.files)}
            className={className + ' ' + (error ? 'error' : '')}
            {...props}
        />,
    ),


    TextArea = forwardRef((
        {
            value,
            type,
            error,
            onChange,
            className = '',
            ...props
        },
        ref,
    ) =>
        <textarea
            ref={ref}
            value={value}
            onChange={e =>
                onChange(
                    type === 'number'
                        ? parseFloat(e.target.value)
                        : e.target.value,
                )
            }
            className={className + ' ' + (error ? 'error' : '')}
            title={error}
            {...props}
        />,
    ),


    Select_ = ({
        placeholder = '',
        opts,
        value,
        onChange,
        className = '',
        error,
        ...props
    }) =>
        <Select.Root
            value={value}
            onValueChange={onChange}
            className={className + ' ' + (error ? 'error' : '')}
            {...props}
        >
            <Select.Trigger
                placeholder={placeholder}
                style={{border: error ? '2px solid red' : 'none'}}
            />

            <Select.Content>
                {Object.entries(opts).map(([title, val]) =>
                    <Select.Item
                        key={title}
                        value={val}
                        children={title}
                    />)}
            </Select.Content>
        </Select.Root>,


    BulkAdd = ({jsonSchema, onComplete}) => {
        const
            bulkAddElemRef = useRef(),

            [bulkAddResult, setBulkAddResult] = useState(null),

            triggerBulkAddFileWidget = () =>
                bulkAddElemRef.current?.click(),

            handleBulkAdd = async files => {
                if (!files[0])
                    return

                const
                    fileContent = await readFile(files[0], 'text'),
                    parsed = parseAndValidateCSV(fileContent, jsonSchema)

                setBulkAddResult(parsed)

                onComplete(parsed)
            }

        return <>
            <Button
                children='Import'
                onClick={triggerBulkAddFileWidget}
            />

            <FileInput
                ref={bulkAddElemRef}
                accept='text/csv'
                onChange={handleBulkAdd}
                style={{display: 'none'}}
            />

            <Dialog.Root
                open={bulkAddResult}
                onOpenChange={() => setBulkAddResult(null)}
            >
                {bulkAddResult &&
                    <Dialog.Content aria-describedby={undefined}>
                        <Dialog.Title>
                            Successfully
                            added {bulkAddResult.valid.length} records
                        </Dialog.Title>

                        {bulkAddResult.invalid.length > 0 && <>
                            <p>
                                <strong>{bulkAddResult.invalid.length}</strong>
                                &nbsp;records couldn't be parsed / validated.
                                See errors below:
                            </p>

                            <pre>
                                {JSON.stringify(
                                    bulkAddResult.invalid, false, 4)}
                            </pre>
                        </>}
                    </Dialog.Content>
                }
            </Dialog.Root>
        </>
    },


    ExcelTable = ({
        items = [],
        schema = [],
        formErrors = [],
        onChange,
        onAdd,
        onDelete,
        newItemFirstInputRef: newItemFirstInputRef_,
    }) => {
        const
            newItemFirstInputRef = newItemFirstInputRef_ || useRef(),

            [showTips, toggleTips] = useState(false),

            handleAdd = () => {
                onAdd()
                setTimeout(() => newItemFirstInputRef?.current?.focus(), 50)
            },

            handleKeyDown = (itemIdx, e) => {
                if (e.shiftKey && e.key === 'Enter') {
                    e.preventDefault()
                    handleAdd()
                }

                if (e.shiftKey && e.key === 'Backspace')
                    onDelete(itemIdx)
            }

        return <>
            {items.length > 0 &&
                <table className='excel'>
                    <thead>
                        <tr>
                            <th/>
                            {schema.map(([fTitle]) =>
                                <th key={fTitle} children={fTitle} />)}
                        </tr>
                    </thead>

                    <tbody>{items.map((item, itemIdx) =>
                        <tr key={itemIdx}>
                            <td><Button
                                children='-'
                                onClick={() => onDelete(itemIdx)}
                            /></td>

                            {schema.map(([fTitle, type, size, fName], fieldIdx) =>
                                <td key={fTitle}
                                    className={size}
                                >
                                    {typeof fName === 'function'
                                        ? fName(item, itemIdx)

                                        : <TextArea
                                            type={type}
                                            value={item[fName]}
                                            onKeyDown={e => handleKeyDown(itemIdx, e)}
                                            error={formErrors[`${itemIdx}/${fName}`]}
                                            onChange={val => onChange(itemIdx, {[fName]: val})}
                                            ref={el => {
                                                if (
                                                    newItemFirstInputRef
                                                    && itemIdx === items.length - 1
                                                    && fieldIdx === 0
                                                )
                                                    newItemFirstInputRef.current = el
                                            }}
                                        />}
                                </td>,
                            )}
                        </tr>,
                    )}</tbody>
                </table>}

            <Button
                children='Add New'
                onClick={handleAdd}
            />

            <Button
                children='Tips'
                onClick={() => toggleTips(true)}
                color='yellow'
            />

            <Dialog.Root
                open={showTips}
                onOpenChange={() => toggleTips(false)}
            >
                <Dialog.Content aria-describedby={undefined}>
                    <Dialog.Title children='Table tips and hotkeys' />

                    <p>
                        After you create a new item the first input will be
                        focused
                    </p>

                    <p>Press Shift+Enter to create a new item</p>

                    <p>Press Shift+Backspace to delete the current item</p>
                </Dialog.Content>
            </Dialog.Root>
        </>
    }


Input.displayName = 'Input'
FileInput.displayName = 'FileInput'
TextArea.displayName = 'TextArea'
Select_.displayName = 'Select'
BulkAdd.displayName = 'BulkAdd'
ExcelTable.displayName = 'ExcelTable'


export {
    Input,
    FileInput,
    TextArea,
    Select_ as Select,
    BulkAdd,
    ExcelTable,
}
