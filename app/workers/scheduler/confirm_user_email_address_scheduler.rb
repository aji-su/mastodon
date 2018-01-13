# frozen_string_literal: true
require 'sidekiq-scheduler'

class Scheduler::ConfirmUserEmailAddressScheduler
  include Sidekiq::Worker

  def perform
    User.where('confirmed_at is NULL').update_all(:confirmed_at => Time.now)
  end
end
