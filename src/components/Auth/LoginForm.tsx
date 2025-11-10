import React, { useState } from 'react';
import { Eye, EyeOff, Zap, Users, BarChart3, Clock, Shield, Sparkles, CheckCircle2, ArrowRight, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { FeaturesTrain } from './FeaturesTrain';

const features = [
	{
		icon: Zap,
		title: 'AI-Powered Insights',
		description: 'Get intelligent recommendations and automate your workflow',
		color: 'from-yellow-500 to-orange-500',
	},
	{
		icon: Users,
		title: 'Real-Time Collaboration',
		description: 'Work together seamlessly with live updates',
		color: 'from-blue-500 to-cyan-500',
	},
	{
		icon: BarChart3,
		title: 'Advanced Analytics',
		description: 'Track productivity and team performance metrics',
		color: 'from-purple-500 to-pink-500',
	},
	{
		icon: Clock,
		title: 'Smart Time Tracking',
		description: 'Monitor tasks and deadlines effortlessly',
		color: 'from-green-500 to-emerald-500',
	},
	{
		icon: Shield,
		title: 'Enterprise Security',
		description: 'Bank-grade encryption and data protection',
		color: 'from-red-500 to-rose-500',
	},
	{
		icon: Sparkles,
		title: 'Intuitive Interface',
		description: 'Beautiful design that just works',
		color: 'from-indigo-500 to-violet-500',
	},
];

interface LoginFormProps {
  onBackToLanding?: () => void;
}

export function LoginForm({ onBackToLanding }: LoginFormProps) {
	const [isLogin, setIsLogin] = useState(true);
	const [showPassword, setShowPassword] = useState(false);
	const [formData, setFormData] = useState({
		email: '',
		password: '',
		name: '',
	});
	const [loading, setLoading] = useState(false);
	const [googleLoading, setGoogleLoading] = useState(false);
	const { signIn, signUp, signInWithGoogle } = useAuth();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!formData.email.trim() || !formData.password.trim()) {
			toast.error('Please fill in all required fields');
			return;
		}

		if (!isLogin && !formData.name.trim()) {
			toast.error('Please enter your full name');
			return;
		}

		if (formData.password.length < 6) {
			toast.error('Password must be at least 6 characters long');
			return;
		}

		setLoading(true);

		try {
			if (isLogin) {
				await signIn(formData.email.trim(), formData.password);
				toast.success('Welcome back!');
			} else {
				console.log('Starting signup with:', { email: formData.email, name: formData.name });
				const result = await signUp(formData.email.trim(), formData.password, formData.name.trim());
				console.log('Signup completed:', result);

				// Check if email confirmation is required
				if (result?.user && !result?.session) {
					toast.success('Account created! Please check your email to confirm your account.', {
						duration: 6000,
					});
					// Switch to login mode so user can try logging in after confirming email
					setIsLogin(true);
				} else if (result?.session) {
					// User is authenticated and has a session
					toast.success('Account created successfully! Welcome to TrackBoss.AI!');
				} else {
					toast.success('Account created! You can now sign in.');
					setIsLogin(true);
				}
			}
		} catch (error: any) {
			console.error('Authentication error:', error);
			// Show the ACTUAL error message from Supabase
			const errorMessage = error?.message || error?.error_description || 'An error occurred during authentication';
			console.error('Displaying error:', errorMessage);
			toast.error(errorMessage);
		} finally {
			setLoading(false);
		}
	};

	const handleGoogleSignIn = async () => {
		setGoogleLoading(true);
		try {
			const result = await signInWithGoogle();
			if (result?.url) {
				toast.success('Redirecting to Google...');
				window.location.href = result.url;
			} else {
				toast.error('Failed to initiate Google sign-in');
				setGoogleLoading(false);
			}
		} catch (error: any) {
			console.error('Google sign-in error:', error);
			toast.error(error.message || 'Failed to sign in with Google');
			setGoogleLoading(false);
		}
	};

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setFormData({
			...formData,
			[e.target.name]: e.target.value,
		});
	};

	const toggleMode = () => {
		setIsLogin(!isLogin);
		setFormData({
			email: '',
			password: '',
			name: '',
		});
	};

	const isFormDisabled = loading || googleLoading;

	return (
		<div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black overflow-hidden">
			{/* Animated background elements */}
			<div className="absolute inset-0 overflow-hidden">
				<div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
				<div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
				<div className="absolute top-40 left-40 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
			</div>

			{/* Back to Landing Button */}
			{onBackToLanding && (
				<div className="absolute top-6 right-6 z-50 lg:left-6 lg:right-auto">
					<button
						onClick={onBackToLanding}
						className="flex items-center space-x-2 px-4 py-2.5 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white hover:bg-white/20 transition-all shadow-lg hover:shadow-xl"
					>
						<ArrowLeft className="w-4 h-4" />
						<span className="text-sm font-medium">Back to Home</span>
					</button>
				</div>
			)}

			<div className="relative min-h-screen flex">
				{/* Left side - Features showcase */}
				<div className="hidden lg:flex lg:w-1/2 xl:w-3/5 flex-col justify-center px-12 xl:px-20 pt-20">
					<motion.div
						initial={{ opacity: 0, x: -50 }}
						animate={{ opacity: 1, x: 0 }}
						transition={{ duration: 0.8 }}
					>
						<div className="flex items-center space-x-3 mb-8 mt-8">
							<div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-2xl overflow-hidden bg-white p-1">
								<img src="/logo.png" alt="ORBIT LIVE TEAM" className="w-full h-full object-contain" />
							</div>
							<div>
								<h1 className="text-3xl font-bold text-white">ORBIT LIVE TEAM</h1>
								<p className="text-sm text-gray-400">AI-Powered Team Management</p>
							</div>
						</div>

						<h2 className="text-4xl xl:text-5xl font-bold text-white mb-4 leading-tight">
							Transform Your Team's
							<br />
							<span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
								Workflow & Productivity
							</span>
						</h2>

						<p className="text-xl text-gray-400 mb-12">
							AI-powered workspace for modern teams. Collaborate in real-time, track progress, and achieve more together.
						</p>

						{/* Moving Features Train */}
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.8, delay: 0.3 }}
							className="mb-12"
						>
							<FeaturesTrain />
						</motion.div>

						<div className="grid grid-cols-1 gap-6">
							{features.map((feature, index) => (
								<motion.div
									key={feature.title}
									initial={{ opacity: 0, y: 20 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ duration: 0.5, delay: index * 0.1 }}
									className="flex items-start space-x-4 group"
								>
									<div className={`flex-shrink-0 w-12 h-12 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
										<feature.icon className="w-6 h-6 text-white" />
									</div>
									<div className="flex-1">
										<h3 className="text-white font-semibold text-lg mb-1 flex items-center">
											{feature.title}
											<CheckCircle2 className="w-4 h-4 ml-2 text-green-400" />
										</h3>
										<p className="text-gray-400 text-sm">{feature.description}</p>
									</div>
								</motion.div>
							))}
						</div>

						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							transition={{ duration: 0.8, delay: 1 }}
							className="mt-12 p-6 bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 rounded-2xl backdrop-blur-sm"
						>
							<p className="text-white text-sm font-medium mb-2">🚀 Trusted by teams worldwide</p>
							<p className="text-gray-400 text-xs">Join thousands of professionals using ORBIT LIVE TEAM to streamline their workflow</p>
						</motion.div>
					</motion.div>
				</div>

				{/* Right side - Login form */}
				<div className="w-full lg:w-1/2 xl:w-2/5 flex items-center justify-center px-6 py-12">
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.6 }}
						className="w-full max-w-md"
					>
						{/* Mobile logo */}
						<div className="lg:hidden text-center mb-8 mt-12">
							<div className="inline-flex items-center space-x-3 mb-4">
								<div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-2xl overflow-hidden bg-white">
									<img src="/logo.png" alt="ORBIT LIVE TEAM" className="w-full h-full object-contain" />
								</div>
								<div className="text-left">
									<h1 className="text-2xl font-bold text-white">ORBIT LIVE TEAM</h1>
									<p className="text-xs text-gray-400">AI-Powered Management</p>
								</div>
							</div>

							{/* Mobile Features Train */}
							<motion.div
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.6, delay: 0.2 }}
								className="mb-6"
							>
								<FeaturesTrain />
							</motion.div>
						</div>

						<div className="bg-gray-800/50 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-700/50 p-8">
							<div className="text-center mb-8">
								<h2 className="text-3xl font-bold text-white mb-2">
									{isLogin ? 'Welcome Back' : 'Get Started'}
								</h2>
								<p className="text-gray-400">
									{isLogin ? 'Sign in to continue your journey' : 'Create your account in seconds'}
								</p>
							</div>

							{/* Google Sign-In Button */}
							<motion.button
								whileHover={{ scale: 1.02 }}
								whileTap={{ scale: 0.98 }}
								onClick={handleGoogleSignIn}
								disabled={isFormDisabled}
								className="w-full flex items-center justify-center px-6 py-4 border border-gray-600 rounded-xl bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg group mb-6"
							>
								{googleLoading ? (
									<div className="flex items-center space-x-3">
										<div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-900"></div>
										<span className="text-gray-900 font-medium">Connecting...</span>
									</div>
								) : (
									<>
										<svg className="w-6 h-6 mr-3" viewBox="0 0 24 24">
											<path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
											<path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
											<path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
											<path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
										</svg>
										<span className="text-gray-900 font-medium group-hover:text-gray-700">Continue with Google</span>
										<ArrowRight className="w-5 h-5 ml-2 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 transition-transform" />
									</>
								)}
							</motion.button>

							{/* Divider */}
							<div className="relative mb-6">
								<div className="absolute inset-0 flex items-center">
									<div className="w-full border-t border-gray-600" />
								</div>
								<div className="relative flex justify-center text-sm">
									<span className="px-3 bg-gray-800/50 text-gray-400">
										Or continue with email
									</span>
								</div>
							</div>

							<form className="space-y-5" onSubmit={handleSubmit}>
								<AnimatePresence mode="wait">
									{!isLogin && (
										<motion.div
											key="name-field"
											initial={{ opacity: 0, height: 0 }}
											animate={{ opacity: 1, height: 'auto' }}
											exit={{ opacity: 0, height: 0 }}
											transition={{ duration: 0.3 }}
										>
											<label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
												Full Name
											</label>
											<input
												id="name"
												name="name"
												type="text"
												required={!isLogin}
												value={formData.name}
												onChange={handleChange}
												className="block w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
												placeholder="Enter your full name"
												disabled={isFormDisabled}
											/>
										</motion.div>
									)}
								</AnimatePresence>

								<div>
									<label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
										Email Address
									</label>
									<input
										id="email"
										name="email"
										type="email"
										required
										value={formData.email}
										onChange={handleChange}
										className="block w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
										placeholder="you@example.com"
										disabled={isFormDisabled}
									/>
								</div>

								<div>
									<label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
										Password
									</label>
									<div className="relative">
										<input
											id="password"
											name="password"
											type={showPassword ? 'text' : 'password'}
											required
											value={formData.password}
											onChange={handleChange}
											className="block w-full px-4 py-3 pr-12 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
											placeholder={isLogin ? 'Enter password' : 'Min. 6 characters'}
											disabled={isFormDisabled}
											minLength={6}
										/>
										<button
											type="button"
											className="absolute inset-y-0 right-0 pr-3 flex items-center"
											onClick={() => setShowPassword(!showPassword)}
											disabled={isFormDisabled}
										>
											{showPassword ? (
												<EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-300" />
											) : (
												<Eye className="h-5 w-5 text-gray-400 hover:text-gray-300" />
											)}
										</button>
									</div>
								</div>

								<motion.button
									whileHover={{ scale: 1.02 }}
									whileTap={{ scale: 0.98 }}
									type="submit"
									disabled={isFormDisabled || !formData.email.trim() || !formData.password.trim() || (!isLogin && !formData.name.trim())}
									className="w-full flex justify-center items-center py-4 px-4 border border-transparent rounded-xl text-white font-medium bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg shadow-blue-500/50"
								>
									{loading ? (
										<div className="flex items-center space-x-2">
											<div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
											<span>{isLogin ? 'Signing In...' : 'Creating Account...'}</span>
										</div>
									) : (
										<>
											{isLogin ? 'Sign In' : 'Create Account'}
											<ArrowRight className="w-5 h-5 ml-2" />
										</>
									)}
								</motion.button>

								<div className="text-center pt-2">
									<button
										type="button"
										onClick={toggleMode}
										disabled={isFormDisabled}
										className="text-sm text-blue-400 hover:text-blue-300 transition-colors disabled:opacity-50"
									>
										{isLogin ? "Don't have an account? " : 'Already have an account? '}
										<span className="font-semibold underline">
											{isLogin ? 'Sign up' : 'Sign in'}
										</span>
									</button>
								</div>
							</form>
						</div>

						{/* Footer */}
						<div className="text-center mt-8 space-y-2">
							<p className="text-xs text-gray-500">
								© 2025 ORBIT LIVE TEAM. All rights reserved.
							</p>
							<p className="text-xs text-gray-600">
								Developed by <span className="font-medium text-blue-400">Salarkhan Patan</span>
							</p>
						</div>
					</motion.div>
				</div>
			</div>

			<style>{`
				@keyframes blob {
					0%,
					100% {
						transform: translate(0, 0) scale(1);
					}
					33% {
						transform: translate(30px, -50px) scale(1.1);
					}
					66% {
						transform: translate(-20px, 20px) scale(0.9);
					}
				}

				.animate-blob {
					animation: blob 7s infinite;
				}

				.animation-delay-2000 {
					animation-delay: 2s;
				}

				.animation-delay-4000 {
					animation-delay: 4s;
				}
			`}</style>
		</div>
	);
}
