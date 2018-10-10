# frozen_string_literal: true

class Settings::ProfilesController < ApplicationController
  include ObfuscateFilename

  layout 'admin'

  before_action :authenticate_user!
  before_action :set_account
  before_action :check_unupdatable_user, only: [:update]

  obfuscate_filename [:account, :avatar]
  obfuscate_filename [:account, :header]

  def show
    @account.build_fields
  end

  def update
    if UpdateAccountService.new.call(@account, account_params)
      ActivityPub::UpdateDistributionWorker.perform_async(@account.id)
      redirect_to settings_profile_path, notice: I18n.t('generic.changes_saved_msg')
    else
      @account.build_fields
      render :show
    end
  end

  private

  def account_params
    params.require(:account).permit(:display_name, :note, :avatar, :header, :locked, :bot, fields_attributes: [:name, :value])
  end

  def set_account
    @account = current_user.account
  end

  def check_unupdatable_user
    if ENV['PENALTY_ACT_IDS']&.split(',')&.map { |id| id.to_i }&.include? @account.id
      redirect_to settings_profile_path, notice: 'This user can not be changed.'
    end
  end
end
