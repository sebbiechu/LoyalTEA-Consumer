// scripts/app.js
import { supabase } from './supabase-init.js';

/**
 * Auto-format email by appending @loyaltea.app
 */
export function formatEmail(emailInput) {
  const value = emailInput.value.trim();
  emailInput.value = value.includes("@") ? value : `${value}@loyaltea.app`;
}

/**
 * Shared password validation check
 */
export function validatePassword(password) {
  const badgeMap = {
    upper: /[A-Z]/,
    lower: /[a-z]/,
    number: /\d/,
    special: /[!@#$%^&*(),.?":{}|<>]/,
    length: /.{8,}/
  };

  return Object.entries(badgeMap).every(([_, regex]) => regex.test(password));
}

/**
 * Centralized login handler
 */
export async function handleLogin(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    throw new Error(error.message);
  }

  return data.user;
}

/**
 * Centralized register handler
 */
export async function handleRegister(email, password) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password
  });

  if (error) {
    throw new Error(error.message);
  }

  return data.user;
}

/**
 * Redirect if already logged in
 */
export async function redirectIfLoggedIn() {
  const { data } = await supabase.auth.getUser();
  if (data?.user) {
    window.location.href = "home.html";
  }
}
