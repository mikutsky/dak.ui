import * as React from 'react';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import {useEffect, useState} from "react";

const Header = ({ tabs, onClickHandle }) => {
    const [pageName, setPageName] = useState('home');

    useEffect(() => {
        if (!onClickHandle) return;
        onClickHandle(pageName)
    }, [onClickHandle, pageName]);

    const handleChange = (event, page) => {
        setPageName(page);
    };

    return (
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={pageName} onChange={handleChange} aria-label="basic tabs example">
                {tabs.map((tab, index) => (
                    <Tab
                        key={index}
                        id={`simple-tab-${index}`}
                        aria-controls={`simple-tabpanel-${index}`}
                        label={tab.title}
                        value={tab.name}
                    />
                ))}
            </Tabs>
        </Box>
    );
}

export default Header;
