"use client"
import { Button } from '@/components/ui/button'
import { Code2Icon, Download, Monitor, Save, SquareArrowOutUpRight, TabletSmartphone } from 'lucide-react'
import React from 'react'
import ViewCodeBlock from './ViewCodeBlock'
import { toast } from 'sonner'

type Props = {
    SelectedScreenSize: any
    setSelectedScreenSize: any
    generatedCode: any
    onSave?: () => void
    isSaving: boolean
    loading: boolean
}

/* ... imports ... */
import { constructFullHtml } from '@/utils/htmlProcessor'

/* ... */

/* REMOVED LOCAL HTML_CODE */

const WebpageTools = ({ SelectedScreenSize, setSelectedScreenSize, generatedCode, onSave, isSaving, loading }: Props) => {

    const ViewInNewTab = () => {
        if (!generatedCode) return

        const fullHtml = constructFullHtml(generatedCode);
        const blob = new Blob([fullHtml], { type: "text/html" })
        const url = URL.createObjectURL(blob)

        window.open(url, "_blank")
    }

    const downloadCode = () => {
        const fullHtml = constructFullHtml(generatedCode);
        const blob = new Blob([fullHtml], { type: "text/html" })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'index.html'
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
        toast.success("Download successful!")
    }

    return (
        <div className='p-2 shadow rounded-xl w-full flex items-center justify-between'>
            <div className='flex gap-2'>
                <Button variant={'ghost'}
                    onClick={() => setSelectedScreenSize('web')}
                    className={`${SelectedScreenSize == 'web' ? 'border border-primary' : ''}`}
                >
                    <Monitor />
                </Button>
                <Button variant={'ghost'}
                    onClick={() => setSelectedScreenSize('mobile')}
                    className={`${SelectedScreenSize == 'mobile' ? 'border border-primary' : ''}`}
                >
                    <TabletSmartphone />
                </Button>
            </div>
            <div className='flex gap-2'>
                <Button onClick={onSave} disabled={!generatedCode || loading || isSaving}>
                    {isSaving ? "Saving..." : "Save"} <Save className='ml-2 w-4 h-4' />
                </Button>
                <Button variant={'outline'} onClick={() => ViewInNewTab()}> View <SquareArrowOutUpRight /></Button>
                <ViewCodeBlock code={generatedCode}>
                    <Button>Code <Code2Icon /></Button>
                </ViewCodeBlock>
                <Button onClick={downloadCode}>Download <Download /></Button>
            </div>
        </div>
    )
}

export default WebpageTools
