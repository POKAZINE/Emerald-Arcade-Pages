# Emerald Arcade — GitHub Pages版

- このリポジトリだけを対象にする。NexusArk版を参照・変更・起動しない。
- HTML/CSS/JavaScriptの静的サイト。配信対象はdistのみ。APIキー・外部AIサービスへの自動送信は使わない。
- 記録と設定は利用者のブラウザのIndexedDB。同じブラウザを共用する人は記録も共有。端末間の自動同期なし。
- AIへ渡すのは各ゲームのAI用context。秘密情報を人間から完全に隠せない制約を表示する。
- 現在はローカル準備段階。Git push、アップロード、公開は、ユーザーがこのリポジトリと予定URLを確認し明示的に許可するまで行わない。
- 2026-10-31：ユーザーがPOKAZINE/Emerald-Arcade-Pagesへのアップロードとhttps://pokazine.github.io/Emerald-Arcade-Pages/での公開・検証を承認済み。この公開先のみ使用する。
- 公開候補はPOKAZINE/Emerald-Arcade-Pages。旧サイトの設定・履歴・識別子を持ち込まない。
- 公開ワークフローは手動実行のみ。pushしただけでは公開しない。変更時はnpm run checkを実行する。
