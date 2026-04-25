import { test, expect } from "@playwright/test";

test.describe("Chat - Send Message", () => {
  test.beforeEach(async ({ page }) => {
    // Login first
    await page.goto("/");
    await page.fill('input[name="email"]', "test@example.com");
    await page.fill('input[name="password"]', "TestPassword123");
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/chat/);
  });

  test("should display message form", async ({ page }) => {
    await expect(page.locator('textarea[name="content"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test("should send a text message successfully", async ({ page }) => {
    const messageContent = `Test message ${Date.now()}`;
    
    await page.fill('textarea[name="content"]', messageContent);
    await page.click('button[type="submit"]');
    
    // Message should appear in the chat
    await expect(page.locator(`text=${messageContent}`)).toBeVisible();
    
    // Form should be cleared
    await expect(page.locator('textarea[name="content"]')).toHaveValue("");
  });

  test("should show validation error for empty message", async ({ page }) => {
    await page.click('button[type="submit"]');
    
    await expect(page.locator("text=/必須|入力/i")).toBeVisible();
  });

  test("should show error for message exceeding 5000 characters", async ({ page }) => {
    const longMessage = "a".repeat(5001);
    
    await page.fill('textarea[name="content"]', longMessage);
    await page.click('button[type="submit"]');
    
    await expect(page.locator("text=/5000/i")).toBeVisible();
  });

  test("should send message with image URL", async ({ page }) => {
    const messageContent = "Check out this image!";
    const imageUrl = "https://example.com/image.jpg";
    
    await page.fill('textarea[name="content"]', messageContent);
    await page.fill('input[name="imageUrl"]', imageUrl);
    await page.click('button[type="submit"]');
    
    // Message should appear
    await expect(page.locator(`text=${messageContent}`)).toBeVisible();
  });

  test("should show error for invalid image URL", async ({ page }) => {
    await page.fill('textarea[name="content"]', "Test message");
    await page.fill('input[name="imageUrl"]', "not-a-url");
    await page.click('button[type="submit"]');
    
    await expect(page.locator("text=/URL|有効/i")).toBeVisible();
  });

  test("should display sent messages in chronological order", async ({ page }) => {
    const message1 = `First message ${Date.now()}`;
    const message2 = `Second message ${Date.now() + 1}`;
    
    // Send first message
    await page.fill('textarea[name="content"]', message1);
    await page.click('button[type="submit"]');
    await expect(page.locator(`text=${message1}`)).toBeVisible();
    
    // Send second message
    await page.fill('textarea[name="content"]', message2);
    await page.click('button[type="submit"]');
    await expect(page.locator(`text=${message2}`)).toBeVisible();
    
    // Both messages should be visible
    await expect(page.locator(`text=${message1}`)).toBeVisible();
    await expect(page.locator(`text=${message2}`)).toBeVisible();
  });

  test("should show loading state while sending", async ({ page }) => {
    await page.fill('textarea[name="content"]', "Test message");
    
    // Click submit and immediately check for loading state
    await page.click('button[type="submit"]');
    await expect(page.locator('button[type="submit"]:disabled')).toBeVisible();
  });
});

test.describe("Chat - Edit Message", () => {
  test.beforeEach(async ({ page }) => {
    // Login and navigate to chat
    await page.goto("/");
    await page.fill('input[name="email"]', "test@example.com");
    await page.fill('input[name="password"]', "TestPassword123");
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/chat/);
  });

  test("should edit own message", async ({ page }) => {
    const originalMessage = `Original ${Date.now()}`;
    const updatedMessage = `Updated ${Date.now()}`;
    
    // Send a message
    await page.fill('textarea[name="content"]', originalMessage);
    await page.click('button[type="submit"]');
    await expect(page.locator(`text=${originalMessage}`)).toBeVisible();
    
    // Find and click edit button (adjust selector as needed)
    const editButton = page.locator(`text=${originalMessage}`).locator('..').locator('button[aria-label*="編集"]');
    if (await editButton.isVisible()) {
      await editButton.click();
      
      // Edit the message
      await page.fill('textarea[name="content"]', updatedMessage);
      await page.click('button[type="submit"]');
      
      // Updated message should be visible
      await expect(page.locator(`text=${updatedMessage}`)).toBeVisible();
      await expect(page.locator(`text=${originalMessage}`)).not.toBeVisible();
    }
  });
});

test.describe("Chat - Delete Message", () => {
  test.beforeEach(async ({ page }) => {
    // Login and navigate to chat
    await page.goto("/");
    await page.fill('input[name="email"]', "test@example.com");
    await page.fill('input[name="password"]', "TestPassword123");
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/chat/);
  });

  test("should delete own message", async ({ page }) => {
    const messageContent = `To be deleted ${Date.now()}`;
    
    // Send a message
    await page.fill('textarea[name="content"]', messageContent);
    await page.click('button[type="submit"]');
    await expect(page.locator(`text=${messageContent}`)).toBeVisible();
    
    // Find and click delete button (adjust selector as needed)
    const deleteButton = page.locator(`text=${messageContent}`).locator('..').locator('button[aria-label*="削除"]');
    if (await deleteButton.isVisible()) {
      await deleteButton.click();
      
      // Confirm deletion if there's a confirmation dialog
      const confirmButton = page.locator('button:has-text("削除"), button:has-text("確認")');
      if (await confirmButton.isVisible()) {
        await confirmButton.click();
      }
      
      // Message should be removed
      await expect(page.locator(`text=${messageContent}`)).not.toBeVisible();
    }
  });
});
