import React, { useEffect, useState } from 'react'
import { Switch } from 'native-base';

interface InputProps {
    setTerrain: any;
}

const SwitchHeader: React.FC<InputProps> = ({ setTerrain }) => {

    const [isChecked, setIsChecked] = useState<boolean>(false)

    useEffect(() => {
        if (isChecked) {
            setTerrain('standard')
        } else {
            setTerrain('satellite')
        }
    }, [isChecked])

    return (
        <Switch
            isChecked={isChecked}
            onToggle={() => setIsChecked(!isChecked)}
            colorScheme="emerald"
        />
    )
}

export default SwitchHeader