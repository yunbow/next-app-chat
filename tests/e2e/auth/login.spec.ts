import { test, expect } from "@playwright/test";

test.describe("Authentication - Login", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("should display login form", async ({ page }) => {
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test("should show validation errors for empty fields", async ({ page }) => {
    await page.click('button[type="submit"]');
    
    // Wait for validation errors
    await expect(page.locator("text=/メールアドレス|必須/i")).toBeVisible();
  });

  test("should show error for invalid email format", async ({ page }) => {
    await page.fill('input[name="email"]', "invalid-email");
    await page.fill('input[name="password"]', "password123");
    await page.click('button[type="submit"]');
    
    await expect(page.locator("text=/メールアドレス/i")).toBeVisible();
  });

  test("should show error for short password", async ({ page }) => {
    await page.fill('input[name="email"]', "test@example.com");
    await page.fill('input[name="password"]', "short");
    await page.click('button[type="submit"]');
    
    await expect(page.locator("text=/8文字/i")).toBeVisible();
  });

  test("should login successfully with valid credentials", async ({ page }) => {
    // Note: This test requires a test user to exist in the database
    await page.fill('input[name="email"]', "test@example.com");
    await page.fill('input[name="password"]', "TestPassword123");
    await page.click('button[type="submit"]');
    
    // Should redirect to chat page after successful login
    await expect(page).toHaveURL(/\/chat/);
  });

  test("should show error for invalid credentials", async ({ page }) => {
    await page.fill('input[name="email"]', "test@example.com");
    await page.fill('input[name="password"]', "WrongPassword123");
    await page.click('button[type="submit"]');
    
    await expect(page.locator("text=/認証|失敗|エラー/i")).toBeVisible();
  });

  test("should toggle password visibility", async ({ page }) => {
    const passwordInput = page.locator('input[name="password"]');
    const toggleButton = page.locator('button[aria-label*="パスワード"]');
    
    // Initially password should be hidden
    await expect(passwordInput).toHaveAttribute("type", "password");
    
    // Click toggle button
    if (await toggleButton.isVisible()) {
      await toggleButton.click();
      await expect(passwordInput).toHaveAttribute("type", "text");
      
      // Click again to hide
      await toggleButton.click();
      await expect(passwordInput).toHaveAttribute("type", "password");
    }
  });
});

test.describe("Authentication - Register", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    // Navigate to register page (adjust selector as needed)
    const registerLink = page.locator('a[href*="register"], text=/登録|新規/i');
    if (await registerLink.isVisible()) {
      await registerLink.click();
    }
  });

  test("should display registration form", async ({ page }) => {
    await expect(page.locator('input[name="name"]')).toBeVisible();
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
    await expect(page.locator('input[name="confirmPassword"]')).toBeVisible();
  });

  test("should show validation errors for weak password", async ({ page }) => {
    await page.fill('input[name="name"]', "Test User");
    await page.fill('input[name="email"]', "newuser@example.com");
    await page.fill('input[name="password"]', "weak");
    await page.fill('input[name="confirmPassword"]', "weak");
    await page.click('button[type="submit"]');
    
    await expect(page.locator("text=/8文字|大文字|小文字|数字/i")).toBeVisible();
  });

  test("should show error for mismatched passwords", async ({ page }) => {
    await page.fill('input[name="name"]', "Test User");
    await page.fill('input[name="email"]', "newuser@example.com");
    await page.fill('input[name="password"]', "Password123");
    await page.fill('input[name="confirmPassword"]', "Password456");
    await page.click('button[type="submit"]');
    
    await expect(page.locator("text=/一致/i")).toBeVisible();
  });
});
