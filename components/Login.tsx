import React, { useState } from 'react';
import { auth, firestore } from '../firebase';
// FIX: Use the correct exported names from constants.ts
import { INITIAL_ACCOUNTS, INITIAL_SUPPLIERS } from '../constants';

const Login: React.FC = () => {
  const [isLoginView, setIsLoginView] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!email || !password) {
      setError("Veuillez entrer une adresse e-mail et un mot de passe.");
      setLoading(false);
      return;
    }

    try {
      if (isLoginView) {
        await auth.signInWithEmailAndPassword(email, password);
      } else {
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        
        // When a new user is created, seed their initial data
        if (userCredential.user) {
          try {
            const user = userCredential.user;
            const batch = firestore.batch();
            const suppliersRef = firestore.collection('users').doc(user.uid).collection('suppliers');
            const accountsRef = firestore.collection('users').doc(user.uid).collection('accounts');
            
            // FIX: Use the correct constant name
            INITIAL_ACCOUNTS.forEach(account => {
              const docRef = accountsRef.doc();
              batch.set(docRef, account);
            });
            // FIX: Use the correct constant name
            INITIAL_SUPPLIERS.forEach(supplier => {
                const docRef = suppliersRef.doc();
                batch.set(docRef, supplier);
            });
            
            await batch.commit();
          } catch (dbError: any) {
              // This is a critical failure. The user was created in Auth, but the DB setup failed.
              // To leave the system in a clean state, we should delete the newly created user
              // so they can try to sign up again.
              await userCredential.user.delete();

              console.error("Failed to seed data during sign up:", dbError);
              if (dbError.code === 'permission-denied') {
                  setError("Échec de l'inscription : Impossible de configurer le compte. Veuillez vérifier les permissions de la base de données.");
              } else {
                  setError("Échec de l'inscription : Une erreur est survenue lors de l'initialisation de votre compte.");
              }
              setLoading(false);
              return; // Stop execution to prevent further issues.
          }
        }
      }
    } catch (authError: any) {
      switch (authError.code) {
        case 'auth/user-not-found':
        case 'auth/wrong-password':
          setError('Adresse e-mail ou mot de passe incorrect.');
          break;
        case 'auth/email-already-in-use':
          setError('Cette adresse e-mail est déjà utilisée.');
          break;
        case 'auth/weak-password':
          setError('Le mot de passe doit comporter au moins 6 caractères.');
          break;
        default:
          setError('Une erreur s\'est produite. Veuillez réessayer.');
          break;
      }
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
            <svg className="h-12 w-auto text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          RASMAL GROUP Virement
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          {isLoginView ? 'Connectez-vous à votre compte' : 'Créez un nouveau compte'}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Adresse e-mail
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Mot de passe
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>
            
            {error && (
                <div className="bg-red-50 p-3 rounded-md">
                    <p className="text-sm text-red-700">{error}</p>
                </div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300"
              >
                {loading ? 'Chargement...' : (isLoginView ? 'Se connecter' : 'S\'inscrire')}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  {isLoginView ? 'Vous n\'avez pas de compte ?' : 'Vous avez déjà un compte ?'}
                </span>
              </div>
            </div>

            <div className="mt-6">
              <button
                onClick={() => {
                    setIsLoginView(!isLoginView);
                    setError(null);
                }}
                className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
              >
                {isLoginView ? 'Créer un compte' : 'Se connecter'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;