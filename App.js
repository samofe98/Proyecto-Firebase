import React from 'react';
import { StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Login from './screens/Login';
import Home from './screens/Home';
import Clientes from './screens/Clientes';
import Productos from './screens/Productos';
import Carrito from './screens/Carrito';
import Facturas from './screens/Facturas';
import RegistroNuevo from './screens/RegistroNuevo';
import GestionUsuarios from './screens/GestionUsuarios';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { appFirebase } from './firebase';

const auth = getAuth(appFirebase);

export default function App() {
    const Stack = createStackNavigator();

    const handleRegistrar = async (datosUsuario) => {
        const { nombre, apellido, correo, contrasena } = datosUsuario;

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, correo, contrasena);
            const user = userCredential.user;

            console.log('Usuario registrado exitosamente:', user);
        } catch (error) {
            console.error('Error al registrar usuario:', error);
        }
    };

    return (
        <NavigationContainer>
            <Stack.Navigator>
                <Stack.Screen
                    name="Login"
                    component={Login}
                    options={{
                        title: "LOGIN",
                        headerTintColor: "white",
                        headerTitleAlign: "center",
                        headerStyle: { backgroundColor: "#525FE1" },
                    }}
                />
                <Stack.Screen
                    name="Home"
                    component={Home}
                    options={{
                        title: "HOME",
                        headerTintColor: "white",
                        headerTitleAlign: "center",
                        headerStyle: { backgroundColor: "#525FE1" }
                    }}
                />
                <Stack.Screen
                    name="Clientes"
                    component={Clientes}
                    options={{
                        title: "CLIENTES",
                        headerTintColor: "white",
                        headerTitleAlign: "center",
                        headerStyle: { backgroundColor: "#525FE1" }
                    }}
                />
                <Stack.Screen
                    name="Productos"
                    component={Productos}
                    options={{
                        title: "PRODUCTOS",
                        headerTintColor: "white",
                        headerTitleAlign: "center",
                        headerStyle: { backgroundColor: "#525FE1" }
                    }}
                />
                <Stack.Screen
                    name="Carrito"
                    component={Carrito}
                    options={{
                        title: "CARRITO DE COMPRA",
                        headerTintColor: "white",
                        headerTitleAlign: "center",
                        headerStyle: { backgroundColor: "#525FE1" }
                    }}
                />
                <Stack.Screen
                    name="Facturas"
                    component={Facturas}
                    options={{
                        title: "FACTURAS",
                        headerTintColor: "white",
                        headerTitleAlign: "center",
                        headerStyle: { backgroundColor: "#525FE1" }
                    }}
                />
                <Stack.Screen
                    name="RegistroNuevo"
                    component={RegistroNuevo}
                    options={{
                        title: "USUARIOS NUEVOS",
                        headerTintColor: "white",
                        headerTitleAlign: "center",
                        headerStyle: { backgroundColor: "#525FE1" }
                    }}
                    initialParams={{ onRegistrar: handleRegistrar }}
                />
                <Stack.Screen
                    name="GestionUsuarios"
                    component={GestionUsuarios}
                    options={{
                        title: "GESTION DE USUARIOS",
                        headerTintColor: "white",
                        headerTitleAlign: "center",
                        headerStyle: { backgroundColor: "#525FE1" },
                    }}
                />
            </Stack.Navigator>
        </NavigationContainer>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
});
