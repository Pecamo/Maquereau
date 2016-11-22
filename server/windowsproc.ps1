Add-Type @"
  using System;
  using System.Runtime.InteropServices;
  public class Tricks {
    [DllImport("user32.dll")]
    public static extern IntPtr GetForegroundWindow();
}
"@

While ($true) {
    get-process | ? { $_.mainwindowhandle -eq [tricks]::GetForegroundWindow() } | select-object -first 1
    Start-Sleep -m 300
}