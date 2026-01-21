import {Select} from '@radix-ui/themes'
import * as Label from '@radix-ui/react-label'


const
    Input = ({label, type = 'text', value, onChange, ...props}) => <>
        <Label.Root children={label} />

        <input
            type={type}
            value={value}
            onChange={e => onChange(e.target.value)}
            {...props}
        />
    </>,


    FileInput = ({label, value, onChange, ...props}) => <>
        <Label.Root children={label} />

        <input
            type='file'
            value={value}
            onChange={onChange}
            {...props}
        />
    </>,


    TextArea = ({label, value, onChange, ...props}) => <>
        <Label.Root children={label} />

        <textarea
            value={value}
            onChange={e => onChange(e.target.value)}
            {...props}
        />
    </>,


    Select_ = ({label, placeholder = '', opts, value, onChange}) => <>
        <Label.Root children={label} />

        <Select.Root
            value={value}
            onValueChange={onChange}
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
