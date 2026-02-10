using System;
using System.IO;
using UnityEditor;
using UnityEditor.Build.Reporting;

public static class BuildWindows
{
    private const string ScenePath = "Assets/Scenes/MainScene.unity";
    private const string OutputDir = "Build/Windows";
    private const string ExeName = "UnityShooter.exe";

    [MenuItem("Build/Build Windows EXE")]
    public static void BuildFromMenu()
    {
        Build();
    }

    public static void Build()
    {
        if (!File.Exists(ScenePath))
        {
            throw new Exception($"Scene not found: {ScenePath}. Create scene and save it at this path.");
        }

        Directory.CreateDirectory(OutputDir);

        BuildPlayerOptions buildPlayerOptions = new BuildPlayerOptions
        {
            scenes = new[] { ScenePath },
            locationPathName = Path.Combine(OutputDir, ExeName),
            target = BuildTarget.StandaloneWindows64,
            options = BuildOptions.None
        };

        BuildReport report = BuildPipeline.BuildPlayer(buildPlayerOptions);
        BuildSummary summary = report.summary;

        if (summary.result != BuildResult.Succeeded)
        {
            throw new Exception($"Build failed: {summary.result}");
        }

        UnityEngine.Debug.Log($"Build succeeded: {summary.outputPath}");
    }
}
