const API_URL = 'http://localhost:8000';

interface SignInLoad {

    email: string;
    password: string;

}

interface SignInResponse {

    access_token: string;
    token_type: string;

}

export const apiService = {

    signIn: async (load: SignInLoad): Promise<SignInResponse> => {

    const response = await fetch(`${API_URL}/sign-in`, {

        method: 'POST',
        headers: {
        'Content-Type': 'application/json',
        },
        body: JSON.stringify(load),

    });

    if (!response.ok) {

        const error = await response.json();
        throw new Error(error.message || 'Error al iniciar sesión');

    }

    return await response.json();

    },

};