# frozen_string_literal: true

Rails.application.configure do
  config.x.default_hashtag = ENV['DEFAULT_HASHTAG']
  config.x.default_hashtag_id = ENV['DEFAULT_HASHTAG_ID'].to_i
end
