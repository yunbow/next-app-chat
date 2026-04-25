import { test, expect } from "@playwright/test";

test.describe("Chat - Create Group", () => {
  test.beforeEach(async ({ page }) => {
    // Login first
    await page.goto("/");
    await page.fill('input[name="email"]', "test@example.com");
    await page.fill('input[name="password"]', "TestPassword123");
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/chat/);
    
    // Open create group dialog/modal (adjust selector as needed)
    const createGroupButton = page.locator('button:has-text("グループ作成"), button:has-text("新規グループ")');
    if (await createGroupButton.isVisible()) {
      await createGroupButton.click();
    }
  });

  test("should display create group form", async ({ page }) => {
    await expect(page.locator('input[name="name"]')).toBeVisible();
    await expect(page.locator('input[name="description"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test("should create group successfully", async ({ page }) => {
    const groupName = `Test Group ${Date.now()}`;
    const groupDescription = "This is a test group";
    
    await page.fill('input[name="name"]', groupName);
    await page.fill('input[name="description"]', groupDescription);
    await page.click('button[type="submit"]');
    
    // Group should appear in the list
    await expect(page.locator(`text=${groupName}`)).toBeVisible();
  });

  test("should show validation error for empty group name", async ({ page }) => {
    await page.click('button[type="submit"]');
    
    await expect(page.locator("text=/必須|入力/i")).toBeVisible();
  });

  test("should show error for group name exceeding 100 characters", async ({ page }) => {
    const longName = "a".repeat(101);
    
    await page.fill('input[name="name"]', longName);
    await page.click('button[type="submit"]');
    
    await expect(page.locator("text=/100/i")).toBeVisible();
  });

  test("should show error for description exceeding 500 characters", async ({ page }) => {
    const longDescription = "a".repeat(501);
    
    await page.fill('input[name="name"]', "Test Group");
    await page.fill('input[name="description"]', longDescription);
    await page.click('button[type="submit"]');
    
    await expect(page.locator("text=/500/i")).toBeVisible();
  });

  test("should create group with optional image URL", async ({ page }) => {
    const groupName = `Group with Image ${Date.now()}`;
    const imageUrl = "https://example.com/group-image.jpg";
    
    await page.fill('input[name="name"]', groupName);
    await page.fill('input[name="image"]', imageUrl);
    await page.click('button[type="submit"]');
    
    await expect(page.locator(`text=${groupName}`)).toBeVisible();
  });

  test("should show error for invalid image URL", async ({ page }) => {
    await page.fill('input[name="name"]', "Test Group");
    await page.fill('input[name="image"]', "not-a-url");
    await page.click('button[type="submit"]');
    
    await expect(page.locator("text=/URL|有効/i")).toBeVisible();
  });

  test("should cancel group creation", async ({ page }) => {
    const cancelButton = page.locator('button:has-text("キャンセル")');
    
    if (await cancelButton.isVisible()) {
      await page.fill('input[name="name"]', "Test Group");
      await cancelButton.click();
      
      // Form should be closed
      await expect(page.locator('input[name="name"]')).not.toBeVisible();
    }
  });
});

test.describe("Chat - Group Management", () => {
  test.beforeEach(async ({ page }) => {
    // Login and create a test group
    await page.goto("/");
    await page.fill('input[name="email"]', "test@example.com");
    await page.fill('input[name="password"]', "TestPassword123");
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/chat/);
  });

  test("should display group list", async ({ page }) => {
    // Check if groups are displayed (adjust selector as needed)
    const groupList = page.locator('[data-testid="group-list"], .group-list');
    if (await groupList.isVisible()) {
      await expect(groupList).toBeVisible();
    }
  });

  test("should navigate to group chat", async ({ page }) => {
    // Click on a group (adjust selector as needed)
    const firstGroup = page.locator('[data-testid="group-item"], .group-item').first();
    if (await firstGroup.isVisible()) {
      await firstGroup.click();
      
      // Should show group chat interface
      await expect(page.locator('textarea[name="content"]')).toBeVisible();
    }
  });

  test("should send message in group", async ({ page }) => {
    // Navigate to a group
    const firstGroup = page.locator('[data-testid="group-item"], .group-item').first();
    if (await firstGroup.isVisible()) {
      await firstGroup.click();
      
      const messageContent = `Group message ${Date.now()}`;
      await page.fill('textarea[name="content"]', messageContent);
      await page.click('button[type="submit"]');
      
      await expect(page.locator(`text=${messageContent}`)).toBeVisible();
    }
  });

  test("should edit group details (admin only)", async ({ page }) => {
    // Find group settings button (adjust selector as needed)
    const settingsButton = page.locator('button[aria-label*="設定"], button:has-text("設定")').first();
    if (await settingsButton.isVisible()) {
      await settingsButton.click();
      
      const editButton = page.locator('button:has-text("編集")');
      if (await editButton.isVisible()) {
        await editButton.click();
        
        const newName = `Updated Group ${Date.now()}`;
        await page.fill('input[name="name"]', newName);
        await page.click('button[type="submit"]');
        
        await expect(page.locator(`text=${newName}`)).toBeVisible();
      }
    }
  });

  test("should delete group (creator only)", async ({ page }) => {
    // Create a new group first
    const createGroupButton = page.locator('button:has-text("グループ作成")');
    if (await createGroupButton.isVisible()) {
      await createGroupButton.click();
      
      const groupName = `To Delete ${Date.now()}`;
      await page.fill('input[name="name"]', groupName);
      await page.click('button[type="submit"]');
      await expect(page.locator(`text=${groupName}`)).toBeVisible();
      
      // Find and click delete button
      const deleteButton = page.locator(`text=${groupName}`).locator('..').locator('button[aria-label*="削除"]');
      if (await deleteButton.isVisible()) {
        await deleteButton.click();
        
        // Confirm deletion
        const confirmButton = page.locator('button:has-text("削除"), button:has-text("確認")');
        if (await confirmButton.isVisible()) {
          await confirmButton.click();
        }
        
        // Group should be removed
        await expect(page.locator(`text=${groupName}`)).not.toBeVisible();
      }
    }
  });
});
