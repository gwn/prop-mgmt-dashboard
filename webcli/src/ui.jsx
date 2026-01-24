import {forwardRef, useRef} from 'react'
import {readFile, parseAndValidateCSV, noop} from '@/util'
import {useModal} from '@/context'
import s from './ui.module.css'


const
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
            placeholder = 'Upload',
            onChange = noop,
            className = '',
            ...props
        },
        ref,
    ) => {
        const
            inputRef = ref || useRef(),
            triggerInput = () => inputRef.current?.click()

        return <>
            <Button
                children={value ? value.name : placeholder}
                onClick={triggerInput}
                className={
                    s.fileInput + ' '
                    + (error ? s.error : '')
                    + ' ' + className}
            />

            <input
                ref={inputRef}
                type='file'
                onChange={e => onChange(e.target.files)}
                style={{display: 'none'}}
                {...props}
            />,
        </>
    }),


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
            className={
                s.textarea + ' ' + (error ? s.error : '') + ' ' + className}
            title={error}
            {...props}
        />,
    ),


    Select = ({
        placeholder = '',
        opts,
        value,
        onChange,
        className = '',
        error,
        ...props
    }) =>
        <select
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
        </select>,


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

                <p><table><tbody>
                    {errorSummary.map(({row, errors}) =>
                        errors.map(([fName, errMsg]) =>
                            <tr key={row}>
                                <td><strong>Row {row}:</strong></td>
                                <td><strong>{fName}:</strong></td>
                                <td>{errMsg}</td>
                            </tr>,
                        ),
                    )}
                </tbody></table></p>
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
                            <th/>
                            {schema.map(([fTitle]) =>
                                <th key={fTitle} children={fTitle} />)}
                        </tr>
                    </thead>

                    <tbody>{items.map((item, itemIdx) =>
                        <tr key={itemIdx}>
                            <td className={s.btn}><Button
                                children='-'
                                onClick={() => onDelete(itemIdx)}
                            /></td>

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


Input.displayName = 'Input'
FileInput.displayName = 'FileInput'
TextArea.displayName = 'TextArea'
Modal.displayName = 'Modal'
Select.displayName = 'Select'
BulkAdd.displayName = 'BulkAdd'
ExcelTable.displayName = 'ExcelTable'


export {
    Button,
    Input,
    FileInput,
    TextArea,
    Select,
    Modal,
    BulkAdd,
    ExcelTable,
}
