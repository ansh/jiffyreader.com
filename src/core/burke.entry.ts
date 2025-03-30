import M from "mellowtel"
import { CONFIG_KEY } from "~constants"

const initMBurke = async () => {
    const m = new M(CONFIG_KEY)
    await m.initBurke()
}

initMBurke().catch(console.error) 