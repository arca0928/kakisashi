{
  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-parts.url = "github:hercules-ci/flake-parts";
    systems.url = "github:nix-systems/default";
  };

  outputs = inputs@{
    flake-parts,
    systems,
    ...
  }: flake-parts.lib.mkFlake { inherit inputs; } {
    systems = import systems;

    perSystem = {
      pkgs,
      lib,
      ...
    }: let
      inherit (pkgs.stdenv.hostPlatform) isLinux;
    in {
      devShells.default = pkgs.mkShell {
        packages = [
          pkgs.nixd
          pkgs.nodejs_26
          pkgs.pnpm_12
        ] ++ lib.optionals isLinux [ pkgs.patchelf ];

        env = lib.optionalAttrs isLinux {
          WORKERD_NIX_LOADER = pkgs.stdenv.cc.bintools.dynamicLinker;
        };

        shellHook = lib.optionalString isLinux ''
          if [ -f scripts/prepare-workerd.mjs ]; then
            node scripts/prepare-workerd.mjs
          fi
        '';
      };
    };
  };
}
