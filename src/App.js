import logo from './logo.svg';
import './App.css';
import Home from './Home/Home';
import Header from "./components/Header/Header";
import * as React from "react";
import Telegram from "./Telegram/Telegram";
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import {useEffect, useState} from "react";
import Spinner from "./components/Spinner/Spinner";

const App = () => {
    const [currentPage, setCurrentPage] = useState('home');
    const [globalLoading,setGlobalLoading] = useState(false);
    const [selectedGiveaway, setSelectedGiveaway] = useState(null);

    useEffect(() => {
        handleSelectedGiveaway()
    }, [])

    const handleChangePage = (pageName) => setCurrentPage(pageName);
    const handleSelectedGiveaway = () => fetch(`${process.env.REACT_APP_API_URL}/current_post`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(response => {
            if (!response && !selectedGiveaway)
                return;
            setSelectedGiveaway(response)
        })
        .catch(error => {
            console.error('There was a problem with the fetch operation:', error);
        });

    const getTabs = () => {
        const telegramPage = selectedGiveaway && selectedGiveaway?.status !== 'created' ? [{name: "telegram", title: "Telegram"}] : []
        return [{name: "home", title: "Home"}, ...telegramPage];
    }

    const setCurrentGiveawayHandle = (giveaway) => setSelectedGiveaway(giveaway);

    return (
        <div className="App">
            <Container fixed>
                <Box sx={{ bgcolor: 'background.paper', width: '100%' }}>
                    <Header tabs={getTabs()} onClickHandle={handleChangePage} />
                </Box>
                <Box sx={{ bgcolor: 'background.paper', height: 'calc(100vh - 50px)', overflowX: 'hidden', overflowY: 'auto'}} >
                    {
                        currentPage === 'home' ? (<Home currentGiveaway={selectedGiveaway}
                                                        setCurrentPage={setCurrentPage}
                                                        onSelectedGiveawayHandle={handleSelectedGiveaway}
                                                        setGlobalLoading={setGlobalLoading}></Home>) :
                        currentPage === 'telegram' ? (<Telegram currentGiveaway={selectedGiveaway}
                                                                setCurrentGiveaway={setCurrentGiveawayHandle}
                                                                setGlobalLoading={setGlobalLoading}/>) : null
                    }
                </Box>
            </Container>
            {globalLoading ? (<Box sx={{
                bgcolor: 'background.paper',
                position: 'absolute',
                opacity: 0.8,
                top: 0,
                bottom: 0,
                right: 0,
                left: 0
            }}
            alignContent={"center"}
            >
                <Box sx={{width: 'fit-content', margin: 'auto'}}>
                    <Spinner></Spinner>
                </Box>
            </Box>) : null}
        </div>
    );
}

export default App;
