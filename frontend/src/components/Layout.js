import { useContext } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, Container, Box } from '@mui/material';
import { AuthContext } from '../context/AuthContext';

const Layout = () => {
    const { user, isAuthenticated, handleLogout } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogoutClick = () => {
        handleLogout();
        navigate('/');
    };

    return (
        <>
            <AppBar position="static">
                <Toolbar>
                    {/* Левая часть с меню и основными кнопками */}
                    <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>

                        <Typography variant="h6" component="div" sx={{ mr: 2 }}>
                            ТНИМЦ CyberSec
                        </Typography>

                        <Button color="inherit" component={Link} to="/">На главную</Button>
                        
                        {isAuthenticated && (
                            <>
                                <Button color="inherit" component={Link} to="/courses" sx={{ ml: 1 }}>
                                    Курсы
                                </Button>

                                <Button color="inherit" component={Link} to="/documents" sx={{ ml: 1 }}>
                                    Документы
                                </Button>

                                {isAuthenticated && user?.is_staff && (
                                    <Button color="inherit" component={Link} to="/admin-panel" sx={{ ml: 1 }}>
                                        Админ-панель
                                    </Button>
                                )}
                            </>   
                        )}
                    </Box>


                    {/* Правая часть с кнопками авторизации */}
                    <Box>
                        {isAuthenticated && (
                            <>
                                <Button color="inherit" component={Link} to="/profile" sx={{ ml: 1 }}>
                                Профиль
                                </Button>
                            </>   
                        )}
                            
                        {isAuthenticated ? (
                            <Button 
                                variant='outlined' 
                                color="white" 
                                onClick={handleLogoutClick} 
                                sx={{
                                    backgroundColor: "white",
                                    color: "#227ad2",
                                }}
                            >
                                Выйти
                            </Button>
                        ) : (
                            <>
                                <Button color='inherit' component={Link} to="/login">Вход</Button>
                                <Button color='inherit' component={Link} to="/register" sx={{ ml: 1 }}>Регистрация</Button>
                            </>
                        )}
                    </Box>
                </Toolbar>
            </AppBar>

            <Container maxWidth="md" sx={{ mt: 4 }}>
                <Outlet />
            </Container>
        </>
    );
};

export default Layout;