import {forwardRef} from 'react'
import {Select} from '@radix-ui/themes'
import * as Label from '@radix-ui/react-label'


const
    Input = forwardRef((
        {label, type = 'text', value, onChange, ...props},
        ref,
    ) => <>
        {label && <Label.Root children={label} />}

        <input
            ref={ref}
            type={type}
            value={value}
            onChange={e => onChange(e.target.value)}
            {...props}
        />
    </>),


    FileInput = forwardRef((
        {label, value, onChange, ...props},
        ref,
    ) => <>
        {label && <Label.Root children={label} />}

        <input
            ref={ref}
            type='file'
            value={value}
            onChange={e => onChange(e.target.files)}
            {...props}
        />
    </>),


    TextArea = ({
        label,
        value,
        onChange,
        ...props
    }) => <>
        {label && <Label.Root children={label} />}

        <textarea
            value={value}
            onChange={e => onChange(e.target.value)}
            {...props}
        />
    </>,


    Select_ = ({
        label,
        placeholder = '',
        opts,
        value,
        onChange,
        ...props
    }) => <>
        {label && <Label.Root children={label} />}

        <Select.Root
            value={value}
            onValueChange={onChange}
            {...props}
        >
            <Select.Trigger placeholder={placeholder} />

            <Select.Content>
                {Object.entries(opts).map(([title, val]) =>
                    <Select.Item
                        key={title}
                        value={val}
                        children={title}
                    />)}
            </Select.Content>
        </Select.Root>
    </>


export {
    Input,
    FileInput,
    TextArea,
    Select_ as Select,
}
