import {useState, useRef} from 'react'
import {Button, Dialog} from '@radix-ui/themes'
import {extractPropertyDeclarationPdf} from '@/api'
import {FileInput} from '@/ui'


export default function DeclarationFileEditor({
    value,
    onChange,
    onCancel,
}) {
    const
        declarationFileWidgetRef = useRef(null),

        openDeclarationFileWidget = () =>
            declarationFileWidgetRef.current?.click(),

        [loadingDialogOpen, toggleLoadingDialog] = useState(false),

        handleFileUpload = async files => {
            if (!files[0])
                return

            toggleLoadingDialog(true)

            const extractedPropRec =
                await extractPropertyDeclarationPdf(files[0])

            toggleLoadingDialog(false)

            onChange({
                file: files[0],
                extractedPropRec,
            })
        }

    return (
        <div>
            <h1>Got Teilungserklärung?</h1>

            <Button
                children='Yes'
                onClick={openDeclarationFileWidget}
            />

            <Button
                children='No'
                onClick={onCancel}
            />

            <FileInput
                ref={declarationFileWidgetRef}
                accept='application/pdf'
                onChange={handleFileUpload}
                style={{display: 'none'}}
            />

            <Dialog.Root open={loadingDialogOpen}>
                <Dialog.Content aria-describedby={undefined}>
                    <Dialog.Title children='Extracting data' />
                    Can take up to a minute
                </Dialog.Content>
            </Dialog.Root>
        </div>
    )
}
