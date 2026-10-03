export const LINKS = {
  site: "https://www.stormlog.dev",
  docs: "https://stormlog.readthedocs.io/en/latest/",
  docsArchitecture: "https://stormlog.readthedocs.io/en/latest/architecture.html",
  docsInference: "https://stormlog.readthedocs.io/en/latest/inference.html",
  docsCli: "https://stormlog.readthedocs.io/en/latest/cli.html",
  docsTui: "https://stormlog.readthedocs.io/en/latest/tui.html",
  docsCpu: "https://stormlog.readthedocs.io/en/latest/cpu_compatibility.html",
  docsCookbook: "https://stormlog.readthedocs.io/en/latest/cookbook/index.html",
  docsMatrix: "https://stormlog.readthedocs.io/en/latest/compatibility_matrix.html",
  docsReport: "https://stormlog.readthedocs.io/en/latest/report_contract.html",
  github: "https://github.com/Silas-Asamoah/stormlog",
  release: "https://github.com/Silas-Asamoah/stormlog/releases/tag/v0.4.0",
  changelog: "https://github.com/Silas-Asamoah/stormlog/blob/main/CHANGELOG.md",
  pypi: "https://pypi.org/project/stormlog/",
  blogIntro: "https://www.stormlog.dev/blogs/introducing-stormlog",
  blogStart: "https://www.stormlog.dev/blogs/getting-started",
  blogLeak: "https://www.stormlog.dev/blogs/memory-leak-walkthrough",
  blogArtifacts: "https://www.stormlog.dev/blogs/artifacts-explained",
  blogDistributed: "https://www.stormlog.dev/blogs/distributed-diagnostics",
  blogJaxInfer: "https://www.stormlog.dev/blogs/jax-and-inference-profiling",
} as const;

export const ISSUE = (n: number) => `${LINKS.github}/issues/${n}`;
