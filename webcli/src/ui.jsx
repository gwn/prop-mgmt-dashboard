import {forwardRef, useRef} from 'react'
import {readFile, downloadFile, parseAndValidateCSV, noop} from '@/util'
import {useModal} from '@/context'
import s from './ui.module.css'


const
    ErrorScene = ({
        message = 'An error occurred, try refreshing the page',
    }) => <>
        <h3>Error</h3>
        <p children={message} />
    </>,


    Button = ({className, ...props}) =>
        <button
            className={s.button + ' ' + className}
            {...props}
        />,


    Input = forwardRef((
        {
            type = 'text',
            value,
            onChange = noop,
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
            className={s.input + ' ' + (error ? s.error : '') + ' ' + className}
            title={error}
            onChange={e =>
                onChange(
                    type === 'number'
                        ? (e.target.value ? parseFloat(e.target.value) : '')
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
            placeholder = 'Upload',
            onChange = noop,
            className = '',
            ...props
        },
        ref,
    ) => {
        const
            setModalScene = useModal(),

            fileInputRef = ref || useRef(),

            handleWidgetTrigger = () => {
                if (!value)
                    return fileInputRef.current?.click()

                setModalScene(FileInputDialog, {
                    value,

                    onCancel: () => setModalScene(null),

                    onChangeRequest: () => {
                        fileInputRef.current?.click()
                        setModalScene(null)
                    },

                    onDeleteRequest: () => {
                        onChange([])
                        setModalScene(null)
                    },

                    onDownloadRequest: () => {
                        downloadFile(value)
                        setModalScene(null)
                    },
                })
            }

        return <>
            <Button
                children={value ? value.name : placeholder}
                onClick={handleWidgetTrigger}
                className={
                    s.fileInput + ' '
                    + (error ? s.error : '')
                    + ' ' + className}
            />

            <input
                ref={fileInputRef}
                type='file'
                onChange={e => onChange(e.target.files)}
                style={{display: 'none'}}
                {...props}
            />
        </>
    }),


    FileInputDialog = ({
        value,
        onDownloadRequest,
        onChangeRequest,
        onDeleteRequest,
        onCancel,
    }) => <>
        <p children={value.name} />

        <p>
            <Button children='Download' onClick={onDownloadRequest} />
            <Button children='Change' onClick={onChangeRequest} />
            <Button children='Delete' onClick={onDeleteRequest} />
            <Button children='Cancel' onClick={onCancel} />
        </p>
    </>,


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
            onChange={e => {
                if (type !== 'number')
                    return onChange(e.target.value)

                const parsed = parseFloat(e.target.value)

                onChange(isNaN(parsed) ? '' : parsed)
            }}
            className={
                s.textarea + ' ' + (error ? s.error : '') + ' ' + className}
            title={error}
            {...props}
        />,
    ),


    Select = forwardRef((
        {
            placeholder = '',
            opts,
            value,
            onChange,
            className = '',
            error,
            ...props
        },
        ref,
    ) =>
            <select
                ref={ref}
                value={value}
                onChange={e => onChange(e.target.value)}
                className={
                    s.select + ' ' + (error ? s.error : '') + ' ' + className}
                title={error}
                {...props}
            >
                <option
                    value=''
                    children={placeholder}
                    disabled
                    hidden
                />

                {Object.entries(opts).map(([title, val]) =>
                    <option
                        key={title}
                        value={val}
                        children={title}
                    />)}
            </select>
    ),


    Modal = ({
        onClose,
        children,
    }) => {
        const handleBackdropClick = e =>
            e.target === e.currentTarget && onClose()

        return (
            <div className={s.modal}>
                <div
                    onClick={handleBackdropClick}
                    className={s.backdrop}
                >
                    <div className={s.container}>
                        <div
                            children={children}
                            className={s.content}
                        />
                    </div>
                </div>
            </div>
        )
    },


    Confirm = ({onConfirm, onCancel}) => <>
        <p>Are you sure?</p>

        <p>
            <Button children='Yes' onClick={onConfirm} />
            <Button children='No' onClick={onCancel} />
        </p>
    </>,


    BulkAdd = ({jsonSchema, onComplete}) => {
        const
            setModalScene = useModal(),

            handleBulkAdd = async files => {
                if (!files[0])
                    return

                const
                    fileContent = await readFile(files[0], 'text'),
                    parsed = parseAndValidateCSV(fileContent, jsonSchema)

                setModalScene(BulkAddResult, parsed)
                onComplete(parsed)
            }

        return <FileInput
            accept='text/csv'
            placeholder='Import CSV'
            onChange={handleBulkAdd}
        />
    },


    BulkAddResult = ({valid, invalid}) => {
        const errorSummary =
            invalid.map(i => ({
                row: i.row,
                errors: i.errors.map(e => [e.instancePath.slice(1), e.message]),
            }))

        return <>
            <p>Successfully added {valid.length} records</p>

            {invalid.length > 0 && <>
                <p>
                    <strong>{invalid.length}</strong> records couldn't be
                    parsed / validated:
                </p>

                <table><tbody>
                    {errorSummary.map(({row, errors}) =>
                        errors.map(([fName, errMsg]) =>
                            <tr key={row}>
                                <td><strong>Row {row}:</strong></td>
                                <td><strong>{fName}:</strong></td>
                                <td>{errMsg}</td>
                            </tr>,
                        ),
                    )}
                </tbody></table>
            </>}
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

            setModalScene = useModal(),

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
                <table className={s.excel}>
                    <thead>
                        <tr>
                            {schema.map(([fTitle]) =>
                                <th key={fTitle} children={fTitle} />)}

                            <th children='Del' />
                        </tr>
                    </thead>

                    <tbody>{items.map((item, itemIdx) =>
                        <tr key={itemIdx}>
                            {schema.map(([fTitle, type, size, fName], fieldIdx) =>
                                <td key={fTitle}
                                    className={s[size]}
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

                            <td className={s.btn}><Button
                                children='x'
                                onClick={() => onDelete(itemIdx)}
                            /></td>
                        </tr>,
                    )}</tbody>
                </table>}

            <Button
                children='Add New'
                onClick={handleAdd}
            />

            <Button
                children='Tips'
                onClick={() => setModalScene(TableTips)}
                color='yellow'
            />
        </>
    },


    TableTips = () => <>
        <p>After you create a new item the first input will be focused</p>

        <p>Press Shift+Enter to create a new item</p>

        <p>Press Shift+Backspace to delete the current item</p>
    </>


ErrorScene.displayName = 'Error'
Button.displayName = 'Button'
Input.displayName = 'Input'
FileInput.displayName = 'FileInput'
TextArea.displayName = 'TextArea'
Select.displayName = 'Select'
Modal.displayName = 'Modal'
Confirm.displayName = 'Confirm'
BulkAdd.displayName = 'BulkAdd'
ExcelTable.displayName = 'ExcelTable'


export {
    ErrorScene,
    Button,
    Input,
    FileInput,
    TextArea,
    Select,
    Modal,
    Confirm,
    BulkAdd,
    ExcelTable,
}
