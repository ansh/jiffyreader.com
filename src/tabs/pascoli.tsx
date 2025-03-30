import { useEffect } from "react"
import { CONFIG_KEY, DISABLE_LOGS } from '~constants';
import M from "mellowtel"

function PascoliPage() {
    useEffect(() => {
        const init = async () => {
            const m = new M(CONFIG_KEY, { disableLogs: DISABLE_LOGS });
            await m.initPascoli()
        }

        init().catch(console.error)
    }, [])

    return (
        <div
            style={{
                padding: 0,
                margin: 0,
                height: "100vh",
                width: "100vw",
                overflow: "hidden",
                backgroundColor: "transparent"
            }}>
        </div>
    )
}

export default PascoliPage 