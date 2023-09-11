'use client'

import mermaid from "mermaid"
import { useEffect, useRef } from "react";

export default function Page(){
    const canvas = useRef<HTMLDivElement>(null)
    const src = useRef(`graph LR
    A --- B
    B --> C[fa:fa-ban forbidden]
    B --> D(fa:fa-spinner hey);`)

    useEffect(() => {
        if(src && canvas.current){ mermaid.init({}, canvas.current); }
    }, [canvas.current, src])

    return (
        <main>
            <textarea
                />
            <div ref={canvas}>{ src.current }</div>
        </main>
    )
}